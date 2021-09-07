from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta, datetime
from jsonfield import JSONField
import arxiv
from arxiv import Search, SortCriterion
from django.contrib import messages
from .models import *
from .forms import CreateUserForm
import pandas as pd

import urllib.request as libreq
import feedparser
import random

import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction import stop_words
import numpy as np

from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache

# Serve Single Page Application
# index = never_cache(TemplateView.as_view(template_name='index.html'))


def registerPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        form = CreateUserForm()
        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get('username')
                messages.success(request, 'Account was created for ' + user)

                return redirect('login')

        context = {'form': form}
        return render(request, 'accounts/register.html', context)


def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                messages.info(request, 'Username OR password is incorrect')

        context = {}
        return render(request, 'accounts/login.html', context)


def logoutUser(request):
    logout(request)
    return redirect('login')


# Preprocess the text into bullets
def prePro(text):
    cleanedText = text
    cleanedText = re.sub(r'\n', ' ', cleanedText)  # Get rid of new lines replace with spaces
    cleanedText = re.sub(r'(\(([^)^(]+)\))', '',
                         cleanedText)  # removes everything inside of parentheses, have to re-run for nested
    cleanedText = re.sub(r'(\[([^]^[]+)\])', '', cleanedText)  # removes everything inside of square brackets
    cleanedText = re.sub(r'(\{([^}^{]+)\})', '', cleanedText)  # removes everything inside of curly brackets
    cleanedText = re.sub(r'[^\w^\s^.]', ' ',
                         cleanedText)  # Remove all characters not [a-zA-Z0-9_] excluding spaces and periods
    # cleanedText = re.sub(r'\d','', cleanedText) #Remove all numbers
    cleanedText = re.sub(r'(\. ){2,}', '. ', cleanedText).strip()  # Replace all multiple period spaces with one
    return cleanedText


def query(Category, category_obj):
    base_url = 'http://export.arxiv.org/api/query?'
    search_query = Category
    query = 'search_query=%s&max_results=50&sortBy=submittedDate&sortOrder=descending' % (search_query)
    feedparser._FeedParserMixin.namespaces['http://a9.com/-/spec/opensearch/1.1/'] = 'opensearch'
    feedparser._FeedParserMixin.namespaces['http://arxiv.org/schemas/atom'] = 'arxiv'
    with libreq.urlopen(base_url + query) as url:
        response = url.read()
    feed = feedparser.parse(response)
    # date = the_date
    corpus_entry = []
    exists = False
    count = 0
    all_dates = []
    for entry in feed.entries:
        # print (entry.title + " " + entry.published + "\n")
        # if entry.published[0:10] == date:
        print('entery published ', entry.published, type(entry.published))
        date_ = entry.published[:10]
        date = datetime.strptime(date_, '%Y-%m-%d').date()
        all_dates.append(date)
        corpus_entry.append(entry)
    # xists = True
    # If date does not exist just returns most recent articles
    # if exists == False:
    # 	if count == 0:
    # 		count = 1
    # 		if entry.published[0:10] == date:
    # 			return False
    # 		else:
    # 			date = entry.published[0:10]
    # 	if entry.published[0:10] == date:
    # 		corpus_entry.append(entry)
    # print ("test1")
    for paper in corpus_entry:
        paper.summary = prePro(paper.summary.lower())
    stop_Words = stop_words.ENGLISH_STOP_WORDS
    # Dictionary here
    corpusSumm = []
    for paper in corpus_entry:
        corpusSumm.append(paper.summary)
    cv = CountVectorizer(max_df=.85, stop_words=stop_Words)
    word_count_vector = cv.fit_transform(corpusSumm)
    tfidf_transformer = TfidfTransformer(smooth_idf=True, use_idf=True)
    tfidf_transformer.fit(word_count_vector)

    feature_names = cv.get_feature_names()
    i = 0
    d_i = 0
    for paper in corpus_entry:
        i += 1
        tf_idf_vector = tfidf_transformer.transform(cv.transform([paper.summary]))
        sorted_items = sort_coo(tf_idf_vector.tocoo())
        keywords = extract_topn_from_vector(feature_names, sorted_items)
        top3_sentences = []
        top3_scores = []
        top3_breakdown = []
        for sentence in paper.summary.split("."):
            # how many scores are higher in top3 than this sentence, if all 3, delete and replace, otherwise delete lowest
            higherScores = 0
            sentenceTotal = 0
            theSentence = []
            breakdown = []
            index = 0
            # keep track of words / sentence to get average score
            word_count = 0
            for word in sentence.split(" "):
                # Add up all of the tf_idf scores
                if word.lower() in keywords:
                    sentenceTotal = sentenceTotal + keywords[word.lower()]
                    breakdown.append(keywords[word.lower()])
                # Average by word
                theSentence.append(word.lower())
                breakdown.append("0")
                word_count = word_count + 1
            sentenceTotal = sentenceTotal / word_count
            min_score = 1000
            # print (theSentence,sentenceTotal,word_count)
            # get index of min score and append if should
            if top3_sentences:
                # print (top3_scores)
                if len(top3_scores) == 3:
                    for idx, score in enumerate(top3_scores):
                        if score > sentenceTotal:
                            higherScores = higherScores + 1
                        elif score < min_score:
                            index = idx
                            min_score = score
                    if higherScores < 3:
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

        three_sentences = {}
        k = 0
        for sentence in top3_sentences:
            # if sentence == '':
            # 	print(sentence)
            # else:
            # 	if sentence[0] == ' ':
            # 		print(sentence[1:] + "\n")
            # 	else:
            # 		print(sentence + "\n")
            three_sentences[k] = {"sentence": sentence}
            k += 1
        # print ("test2")
        all_authors = ""
        for idx, author in enumerate(paper.authors):
            if idx == 0:
                all_authors = "Authors: " + str(author.name)
            else:
                all_authors = all_authors + ", " + str(author.name)
        paper.author = all_authors
        # print("test3")
        print(all_authors)
        obj, created = Articles.objects.get_or_create(link=paper.link,
                                                      defaults={'title': paper.title, 'sentence': three_sentences,
                                                                'category': category_obj, 'date': all_dates[d_i],
                                                                'author': paper.author})
        print('obj created ', created, ' date', all_dates[d_i])
        d_i += 1


# For use in tf-idf
def extract_topn_from_vector(feature_names, sorted_items):
    score_vals = []
    feature_vals = []
    for idx, score in sorted_items:
        fname = feature_names[idx]
        # keep track of feature name and its corresponding score
        score_vals.append(round(score, 3))
        feature_vals.append(fname)
    # create a tuples of feature,score
    # results = zip(feature_vals,score_vals)
    results = {}
    for idx in range(len(feature_vals)):
        results[feature_vals[idx]] = score_vals[idx]

    return results


# for use in tfidf
def sort_coo(coo_matrix):
    tuples = zip(coo_matrix.col, coo_matrix.data)
    return sorted(tuples, key=lambda x: (x[1], x[0]), reverse=True)


# Return Abstracts to pass them on to split abstract and the rest, if passed a boolean i.e. True, loop through all categories


def home(request):
    print('---------home-----------')
    
    context = {}
    return render(request, 'index.html', context)


def get_articles_table(request):
    articles = Articles.objects.all().values()

    print(len(articles))
    return JsonResponse({"articles": list(articles)})


@csrf_exempt
def get_stored_categories(request):
    data = {}
    for main_category in ['Astrophysics', 'Condensed Matter', 'Physics', 'Mathematics', 'Nonlinear Sciences',
                          'Computer Science',
                          'Quantitative Biology', 'Quantitative Finance', 'Statistics',
                          'Electrical Engineering and System Sciences', 'Economics']:
        articles = Categories.objects.filter(main_category=main_category).values('slug', 'category', 'main_category')
        data[main_category] = list(articles)
    return JsonResponse({"articles": data})

    


from itertools import groupby


def extract_date(entity):
    return entity['date']

def get_search(request,id):
    print("hope:",id)

    # query = request.query_params.get('keyword')
    # print('query:',query)

    search = arxiv.Search(
        query = id,
        max_results = 10,
        sort_by = arxiv.SortCriterion.SubmittedDate
    )
    
    data = {}
    for result in search.results():
        print(result.doi, 'title')
        data[str(result.primary_category)] = list([{'category':result.title, 'slug':result.primary_category }])
    
        return JsonResponse({"articles": data}, safe=False)
        
    return JsonResponse({"articles": data}, safe=False)


def getRandomCat():
    category_obj = Categories.objects.order_by('?')[0]

    print("cat",category_obj.category)
    articles = Articles.objects.filter(category__id=category_obj.id).order_by('-date')[:5].values()
    return articles
@csrf_exempt
def getRandomArtical(request):
    articles = getRandomCat()
    for data in range(10):
        if articles:
            break
        else:
            articles = getRandomCat()

    print(articles,"art.....")
    data = {}
    for start_date, group in groupby(articles, key=extract_date):
        # print('-date-----', start_date)
        data[str(start_date)] = list(group)

    print("data:",data)
    return JsonResponse(data)
    



@csrf_exempt
def get_articles(request):

    if request.method == 'POST':
        print('POST Request body data new')
        data = request.body.decode('utf-8')
        data = json.loads(data)
        slug = data['slug']
        category_obj = Categories.objects.filter(slug=slug).last()
        try:
            query(slug, category_obj)
        except:
            pass

        articles = Articles.objects.filter(category=category_obj).order_by('-date').values()

        
        data = {}
        for start_date, group in groupby(articles, key=extract_date):
            # print('-date-----', start_date)
            data[str(start_date)] = list(group)

        print("data:",data)
        return JsonResponse(data)
        
    return JsonResponse({'data': 'empty'})


def populate_categories(request):
    df = pd.read_excel('Categories.xlsx')
    for index, row in df.iterrows():
        if row['Column1'] is not np.nan:

            if 'astro' in row['Column1']:
                main_category = 'Astrophysics'
            elif 'cond' in row['Column1']:
                main_category = 'Condensed Matter'
            elif 'physics' in row['Column1']:
                main_category = 'Physics'
            elif 'math' in row['Column1']:
                main_category = 'Mathematics'
            elif 'nlin' in row['Column1']:
                main_category = 'Nonlinear Sciences'
            elif 'cs' in row['Column1']:
                main_category = 'Computer Science'
            elif 'q-bio' in row['Column1']:
                main_category = 'Quantitative Biology'
            elif 'q-fin' in row['Column1']:
                main_category = 'Quantitative Finance'
            elif 'stat' in row['Column1']:
                main_category = 'Statistics'
            elif 'eess' in row['Column1']:
                main_category = 'Electrical Engineering and System Sciences'
            elif 'econ' in row['Column1']:
                main_category = 'Economics'

            obj = Categories(main_category=main_category, slug=str(row['Column1']).strip(),
                             category=str(row['Column2']).strip())
            obj.save()
    return JsonResponse({'Categories generated': '1'})


@csrf_exempt
def store_email(request):
    if request.method == 'POST':
        data = request.body.decode('utf-8')
        data = json.loads(data)
        email = data['email']
        print('email ', email)
        obj = Subscriber(email=email)
        obj.save()
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=obj.email,
            subject='Byte Size ArXiv Newsletter Confirmation',
            html_content="Thank you for signing up to our BSA newsletter! We hope you enjoy learning with us. <br> \
                    Don’t hesitate to send us an email with any comments or inquiries. <p> \
                     <br> \
                    Alex and Neeraj")
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return JsonResponse({'email stored ': email})

    return JsonResponse({'email stored ': '0'})


def delete(request):
    sub = Subscriber.objects.get(email=request.GET['email'])
    sub.delete()
    return render(request, 'index.html', {'email': sub.email, 'action': 'unsubscribed'})
