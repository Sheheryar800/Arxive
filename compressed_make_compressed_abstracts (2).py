import arxiv
import urllib.request as libreq
import feedparser
from io import StringIO
from pathlib import Path
import os
import argparse
import tokenizeText
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction import stop_words
import numpy as np
from scipy.sparse.csr import csr_matrix
import glob

#Preprocess the text into bullets
def prePro(text):
    cleanedText=text
    cleanedText = re.sub(r'\n',' ',cleanedText)#Get rid of new lines replace with spaces
    cleanedText = re.sub(r'(\(([^)^(]+)\))','',cleanedText) #removes everything inside of parentheses, have to re-run for nested
    cleanedText = re.sub(r'(\[([^]^[]+)\])','',cleanedText) #removes everything inside of square brackets
    cleanedText = re.sub(r'(\{([^}^{]+)\})','',cleanedText) #removes everything inside of curly brackets 
    cleanedText = re.sub(r'[^\w^\s^.]',' ', cleanedText) #Remove all characters not [a-zA-Z0-9_] excluding spaces and periods
    #cleanedText = re.sub(r'\d','', cleanedText) #Remove all numbers
    cleanedText = re.sub(r'(\. ){2,}', '. ', cleanedText).strip() #Replace all multiple period spaces with one
    return cleanedText


def query(the_date, Category):
    base_url = 'http://export.arxiv.org/api/query?'
    search_query = Category
    query = 'search_query=%s&max_results=30&sortBy=submittedDate&sortOrder=descending' % (search_query)
    feedparser._FeedParserMixin.namespaces['http://a9.com/-/spec/opensearch/1.1/'] = 'opensearch'
    feedparser._FeedParserMixin.namespaces['http://arxiv.org/schemas/atom'] = 'arxiv'
    with libreq.urlopen(base_url + query) as url:
        response = url.read()
    feed = feedparser.parse(response)
    date = the_date
    corpus_entry = []
    count = 0
    for entry in feed.entries:
        #print (entry.title + " " + entry.published + "\n")
        if count == 0:
            count = 1
            if entry.published[0:10] == date:
                return False
            else:
                date = entry.published[0:10]
        if entry.published[0:10] == date:
            corpus_entry.append(entry)
    for paper in corpus_entry:
        paper.summary = prePro(paper.summary.lower())
    stop_Words = stop_words.ENGLISH_STOP_WORDS
    #Dictionary here
    corpusSumm = []
    for paper in corpus_entry:
        corpusSumm.append(paper.summary)
    cv = CountVectorizer(max_df=.85,stop_words=stop_Words)
    word_count_vector=cv.fit_transform(corpusSumm)
    tfidf_transformer=TfidfTransformer(smooth_idf=True,use_idf=True)
    tfidf_transformer.fit(word_count_vector)

    feature_names = cv.get_feature_names()
    for paper in corpus_entry:
        tf_idf_vector=tfidf_transformer.transform(cv.transform([paper.summary]))
        sorted_items=sort_coo(tf_idf_vector.tocoo())
        keywords=extract_topn_from_vector(feature_names,sorted_items)
        top3_sentences = []
        top3_scores = []
        top3_breakdown = []
        for sentence in paper.summary.split("."):
            #how many scores are higher in top3 than this sentence, if all 3, delete and replace, otherwise delete lowest
            higherScores =0
            sentenceTotal = 0
            theSentence = []
            breakdown = []
            index = 0
            #keep track of words / sentence to get average score
            word_count=0
            for word in sentence.split(" "):
                #Add up all of the tf_idf scores
                if word.lower() in keywords:
                    sentenceTotal = sentenceTotal +keywords[word.lower()]
                    breakdown.append(keywords[word.lower()])
            #Average by word
                theSentence.append(word.lower())
                breakdown.append("0")
                word_count = word_count + 1
            sentenceTotal = sentenceTotal / word_count
            min_score = 1000
            #print (theSentence,sentenceTotal,word_count)
            #get index of min score and append if should
            if top3_sentences:
                #print (top3_scores)
                if len(top3_scores) == 3:
                    for idx, score in enumerate(top3_scores):
                        if score > sentenceTotal:
                            higherScores = higherScores+1
                        elif score < min_score:
                            index = idx
                            min_score = score
                    if higherScores <3:
                        del top3_sentences[index]
                        del top3_scores[index]
                        top3_sentences.append(sentence)
                        top3_scores.append(sentenceTotal)
                        top3_breakdown.append(breakdown)
                        
                else:
                    top3_sentences.append(sentence)
                    top3_scores.append(sentenceTotal)
                    top3_breakdown.append(breakdown)
            else:
                top3_sentences.append(sentence)
                top3_scores.append(sentenceTotal)
                top3_breakdown.append(breakdown)

        print (paper.title +"\n")
        for sentence in top3_sentences:
            if sentence == '':
                print(sentence)
            else:
                if sentence[0] == ' ':
                    print(sentence[1:] + "\n")
                else:
                    print(sentence +"\n")
    print ("\n"+"Category: " + Category + "\n" + "Date: " + date)



#For use in tf-idf
def extract_topn_from_vector(feature_names, sorted_items):
    score_vals = []
    feature_vals = []
    for idx, score in sorted_items:
        fname = feature_names[idx]
        #keep track of feature name and its corresponding score
        score_vals.append(round(score, 3))
        feature_vals.append(fname)
    #create a tuples of feature,score
    #results = zip(feature_vals,score_vals)
    results= {}
    for idx in range(len(feature_vals)):
        results[feature_vals[idx]]=score_vals[idx]
    
    return results

#for use in tfidf
def sort_coo(coo_matrix):
    tuples = zip(coo_matrix.col, coo_matrix.data)
    return sorted(tuples, key=lambda x: (x[1], x[0]), reverse=True)

#Return Abstracts to pass them on to split abstract and the rest, if passed a boolean i.e. True, loop through all categories
def main(the_date,category):
    query(the_date,category)
       

if __name__ == "__main__":
    #Set date 
    the_date = "2020-08-20"
    category = 'cs.LG'
    main(the_date,category)