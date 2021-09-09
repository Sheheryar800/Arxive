import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { SocialIcon } from 'react-social-icons';
import { Layout, Drawer, Menu, Breadcrumb,Row,Col,Typography,Form,Input} from 'antd';
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button';
import { FacebookIcon,FacebookShareButton } from "react-share";
const { Header, Content, Footer } = Layout;
const { Title } = Typography;





class About extends Component {
    state = {  };
    constructor(props){ 
      super(props);
      this.state = {
          articleData:[],
          loading:false,
          dateState:'',
          current: "Submit",
      }
    }

    async componentDidMount() {

      // const url = 'https://bsa-web.herokuapp.com/getRandomArtical';
      const url = 'http://127.0.0.1:8050/getRandomArtical';
      const response = await fetch(url , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      });
      var retval = await response.json();
      const articleResponse = Object.entries(retval);
      console.log('articleResponse my',articleResponse)
      console.log('articleResponse my retval',retval)

      this.setState({
        articleData:articleResponse,
        loading:false,
        dateState:''
      })
      // console.log('MY ARTICLE',this.state.articleData)
    
    }

    async onFinish (values) {
        console.log(values);
        const url = 'https://bsa-web.herokuapp.com/store_email';
        const response = await fetch(url , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({
          "email":values.email
        }),
        });

        const emailResponse = await response.json();
        values = ""
      };

       gotoLink (ele){
        let offsetTop  = document.getElementById(ele).offsetTop;
        window.scrollTo({
            top: offsetTop-100,
            behavior: "smooth"
        });
    }

    state = {
      current: "Submit",
      visible: false
    }
    changeText = (text) => {

        this.setState({ 
          current : text,
        });
    };
    showDrawer = () => {
      this.setState({
        visible: true,
      });
    };
  onClose = () => {
      this.setState({
        visible: false,
      });
    };
    render() {
        const { current, articleData } = this.state
        // console.log("data",articleData);
        console.log("btn:",current);
      return (
        <Layout className="layout">
          <Header className="header-bar">
              <a href='/'>
                <div className="header-bar-logo">
              <Title className="header-bar-title" level={2}> Byte Size Arxiv </Title>
            </div>
              </a>
            <div className="header-bar-menu">
              <Button className="home-button" size='large' href='/'> Home </Button>
              <Button className="bsa-button" size='large' href = '/B.S.A.'> B.S.A. </Button>
              <Button
                className="newsletter-button"
                size='large'
                onClick={() => this.gotoLink('news')}
                type='secondary'
              >
               Newsletter
              </Button>
             </div>
          </Header>
          <div style={{whiteSpace: 'pre-wrap', overflowWrap: 'break-word', color:'#FAEEDC', textAlign:'left',float:'middle'}}>
            <Content style={{color:'#323030', backgroundColor:'white', padding: '0 50px' ,margin:'60px 0', marginLeft:'5em', marginRight:'5em'}}>
                <div className="summary">
                  <div className="summary-content">
                     <Title className="summary-heading" level={1}>Welcome to Byte Size Arxiv</Title>
                     <h3 className="summary-text">
                       We are on a mission to make it easy for you to stay up to date with cutting edge research being shared on Arxiv.org.
                     </h3>
                     <h3 className="get-started-text">
                      To get started, click the button below and select a category to browse Byte-Size summaries of brand new publications; made daily using Machine Learning.
                     </h3>
                      <div className="get-started-button">
                        <Button variant='outlined' href='/B.S.A.'> Try Byte Size Arxiv </Button>
                      </div>
                      <div className={"social-icons"} style={{float:'middle', textAlign:'center', paddingTop:'2em' }}>
                    <SocialIcon className="twitter-icon" url="https://twitter.com/ByteSizeArxiv"/>
                    <SocialIcon  className="fb-icon" url="https://www.facebook.com/ByteSizeArXiv"/>
                    <SocialIcon  className="yt-icon" url="https://m.youtube.com/channel/UCvZQkeHN8tI6H_WAbZ4X1eA"/>
                      </div>
                  </div>
                  <div className="summary-image">
                    <img src={require('../assets/BSA_Logo.png')}/>
                  </div>
                </div>
                <Row>
                <Col span={24} className="newsletter-heading">
                     <Title level={2}>Our Weekly Digest is Now Available!</Title>
                     <h3>
                     Version 1.0 of our weekly newsletter delivers nine summarized articles across the categories: Computers and Society (CS), Machine Learning (CS), and Computational Finance (Quant. Finance).
                     </h3>
                     <h3>
                     Please sign up using the form below or at the bottom of the page and reach out to us with any category requests or concerns. We hope you enjoy!
                     </h3>
                    <h3>
                        If you do not see our confirmation email within a few minutes, please check your spam folder.
                     </h3>
                    <h3>  </h3>
                    <Form name='myform' onFinish={this.onFinish}>
                        <Form.Item name='email'>
                        <Input

                        style={{margin: '0 auto',width:'200px'}}
                        placeholder="Enter Email to subscribe" />
                        </Form.Item>
                        <Button
                            variant='outlined'
                            type="primary"
                            htmlType="submit"
                            onClick={ () => { this.changeText("Submitted!")}  }> {current} 
                            
                        </Button>
                    </Form>
                </Col>
                </Row>

                <Row>
                    <Col span={24} className="building-bsa-heading">
                      <Title level={1}> Building B.S.A. </Title>
                    </Col>
                </Row>
                <div className="building-bsa-content">
                  <div className="building-bsa-image">
                    <img src={require('../assets/BSA.gif')}/>
                  </div>
                  <div className="building-bsa-text">
                    <h3>
                      Everyday there are hundreds of peer-reviewed academic papers filled with cutting edge research being uploaded to Cornell's ArXiv.org. Byte Size Arxiv takes the articles as they are uploaded and isolates three key sentences in the abstract for a quickly digestible summary.
                      This is done using term frequency–inverse document frequency (TF-IDF), a machine learning model.
                    </h3>
                    <h3>
                      The model creates a score for each word (ignoring stopwords). If a given word appears frequently in the abstract it’s score goes up. However, if the word is also common amongst other articles, the score goes down.
                      The words with the highest scores are the most import words unique to the article in question!
                    </h3>
                    <h3>
                      Our goal is to spread this valuable knowledge by sharing key themes at a glance. Please reach out with any questions, concerns or opportunities. We would love to chat!
                    </h3>
                  </div>
                </div>
    <Row style={{height:'445px',overflow:'scroll'}}>
    <Content style={{ padding: "0 50px" }}>
          
            <div
              style={{ background: '#fff', padding: 24, minHeight: 280,textAlign:'left' }}
              className="site-layout-content"
            >
            
        
          {articleData.map((items,idx) =>
          <React.Fragment>
          <Title level={4}>{items[0]}
           </Title>  
          {items[1].map((ingredientsDeal, indx) =>
            <div classname = "article_bunch">
              <a target='_blank' href={ingredientsDeal.link == null ? '' : ingredientsDeal.link}>
              <h2 className = "paper_title">{ingredientsDeal.title}  </h2>  
              </a>
              <h3>{ingredientsDeal.author}</h3>
              
              <ul>
              {Object.values(ingredientsDeal.sentence).map((itemSentence, index) =>
              <li className ="bullets"> {itemSentence.sentence}</li> 
              )}      
              </ul>
              <FacebookShareButton url={ingredientsDeal.link == null ? '' : ingredientsDeal.link} 
              quote={`${ingredientsDeal.title}`}    
              style={{width:'100px',height:'60px'}}
              >
                
                <Button variant="contained" style={{padding:'0px 10px',backgroundColor:"blue"}} color="primary">Share</Button>
              </FacebookShareButton>
            </div>
            
          )} 
          </React.Fragment>
        
          )}
            </div>
          </Content>
    </Row>
                <Row>
                    <Col span={24} style={{textAlign:'center', paddingTop:'2em'}}>
                   <Title level={1} style={{color:'black', paddingBottom:'.3em'}}>
                    About Us
                </Title>
                        <h3>Our mission is to improve how we teach and learn.</h3>
                      <h3>BSA is one component, reach out to learn about what else we're working on!</h3>
                        </Col>
                  </Row>
             <div className="founders">
               <div className="duffy">
                 <div className="duffy-image">
                   <img src={require('../assets/duffy.jpg')}/>
                 </div>
                 <div className="duffy-text-content">
                   <h1>Alex Duffy</h1>
                   <h4>Hi, I'm Alex! I currently work at EY as a Data and Analytics Consultant and am based out of Los Angeles, CA. Prior to EY, I've been lucky to have spent time at Amazon Robotics, Hasbro, ENSEEIHT in France, and MathTree as an engineer, designer, researcher, and instructor.</h4>
                   <h4>Ambiguous problems excite me - I'm curious about building for technical progress in society, particularly how to improve our approach to education.</h4>
                   <h4>Alex received his B.S. in Electrical and Computer Engineering from Northeastern University.</h4>
                   <h4>Get in touch: alx.dfy@gmail.com</h4>
                 </div>
               </div>
               <div className="neeraj">
                 <div className="neeraj-image">
                   <img height='300px' width='' src={require('../assets/neeraj.JPG')}/>
                 </div>
                 <div className="neeraj-text-content">
                  <h1>Neeraj Sudhakar</h1>
                  <h4>Hi, I'm Neeraj Sudhakar! Over the past few years I have had the opportunity to work at Kumon, Wealth Planning Asset Management, Vertex Pharmaceuticals and Mersana Therapeutics as a tutor, quantitative analyst, researcher and process optimization engineer.</h4>
                  <h4>Analytical problem solving while leveraging the power of computing and Machine Learning is of special interest to me. I hope to continue this passion in the financial services industry to deliver unique, timely solutions.</h4>
                  <h4>Neeraj is currently in his final year as a combined BS Chemical Engineering/MS Engineering Management candidate at Northeastern University. </h4>
                  <h4>Get in touch: sudhakarneeraj@gmail.com</h4>
                 </div>
               </div>
                 <div className="donate-content">
                   <Title level={1} style={{color:'black', textAlign:'center', paddingBottom:'.3em'}}>
                    Donation and Support
                </Title>
                     <Col span={24} style={{textAlign:'center'}}>
                     <h4>Help us to improve the site for your use and pay for server + application costs. We are currently working on expanding functionality of the newsletter to allow you to pick your favorite categories.</h4>
                     <h4>If you would like to support us, please consider donating with cryptocurrency or the Paypal button below. Thank you!</h4>
                     <h4>{" "}</h4>
                     <h4>Our ETH Address: (click to copy)</h4>
                     <CopyToClipboard text = {'0x21E9eFA43FA203eb6DAC847b7ccD627e61D860D3'}>
                     <Button variant='outlined'> 0x21E9eFA43FA203eb6DAC847b7ccD627e61D860D3 </Button>
                     </CopyToClipboard>
                     <h4>{" "}</h4>
                     <h4>BTC</h4>
                     <CopyToClipboard text = {'bc1qdxcjxv47mm2wfa8vtpmvweawgzx2ga0njhzkez'}>
                     <Button variant='outlined'> bc1qdxcjxv47mm2wfa8vtpmvweawgzx2ga0njhzkez </Button>
                     </CopyToClipboard>
                     <h4>{" "}</h4>
                     </Col>
                 </div>
                 <div className={"donation-form"} style={{paddingBottom:'.8em'}}>
                     <form action="https://www.paypal.com/donate" method="post" target="_top">
                        <input type="hidden" name="hosted_button_id" value="SF5Z6C6X37EFU" />
                        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                        <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                    </form>
                 </div>
             </div>
          </Content>
        </div>

          <Footer className="footer" id='news'>
        <Title level={3}>Interested in a Weekly Digest?</Title>
              Sign up for our BSA Newsletter!

        <Form name='myform' onFinish={this.onFinish}>
        <Form.Item name='email'>
        <Input

        style={{margin: '0 auto',width:'200px'}}
        placeholder="Enter Email to subscribe" />

        </Form.Item>
        <Button
            variant='outlined'
            type="primary"
            htmlType="submit"
            onClick={ () => { this.changeText("Submitted!")}  }> {current}
      </Button>
        </Form>
        </Footer>
    </Layout>
       );
    }
}

export default About;