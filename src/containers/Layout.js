import React, {Component, createElement} from 'react';
import ReactDOM from 'react-dom';
import { SocialIcon } from 'react-social-icons';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import { Layout, Menu, Breadcrumb, Select,Typography, Spin, Input,Form  } from "antd";
import Button from '@material-ui/core/Button';
import { FacebookIcon,FacebookShareButton } from "react-share";

import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import * as moment from 'moment'
import './layout.css'

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { blue } from '@material-ui/core/colors';



const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;
const { Option } = Select;
const { Title } = Typography;

class CustomLayout extends Component {
  state = { text: 'Submit',
    collapsed: false,
  };
  
  constructor(props){ 
    super(props);
    this.state = {
        text: 'Submit',
        articles:[],
        temp_articles:[],
        selectedSlug:'',
        selectedDate:'',
        articleData:[],
        loading:false,
        dateArray:[],
        dateState:'',
        qState:'',
        width: 0, 
        height: 0,
        sidBarWidth:400,
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  
  


  toggle = () => {

    this.setState({
      collapsed: !this.state.collapsed,
    });
  
  };

  async componentDidMount() {
    const { dateArray } = this.state;
    var date = new Date();
    for(let i = 0 ; i < 5 ; i++){  
      var date = new Date();    
      dateArray[i] = moment(date.setDate(date.getDate() - i)).format('YYYY-MM-DD');       
    } 
    console.log('dateArray',dateArray)

    const url = 'https://bsa-web.herokuapp.com/get_stored_categories';
    // const url = 'http://127.0.0.1:8000/get_stored_categories';
    const response = await fetch(url , {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
    });

    const res = await response.json();

    var retval = Object.entries(res.articles)
    this.setState({
      articles:retval,
      // temp_articles:retval,
  })
    console.log('hamza',res.articles);
    console.log('hamza',retval);

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });

    if( this.state.width <= 770 ){
      this.setState({
        collapsed: !this.state.collapsed,
      });
      console.log("lesser");
    }else{
      this.setState({
        collapsed: this.state.collapsed,
      });
      console.log("greater");
    }

    if(this.state.width <= 500 ){
      this.setState({
        sidBarWidth:300,
      })
    }else{
      this.setState({
        sidBarWidth:400,
      })
    }

  }
  

  async getArticle(slug){
    if( this.state.width <= 770 ){
      this.toggle()
    }
    this.setState({
      loading:true
    })
    this.setState({
      selectedSlug:slug
    })
    console.log('im hit')
    const dataToBeSent = {
      slug:slug,
      recent:'true',
      date:''
    }
     const url = 'https://bsa-web.herokuapp.com/get_articles';
    // const url = 'http://127.0.0.1:8000/get_articles';
    const response = await fetch(url , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify(dataToBeSent),
    });
    var retval = await response.json();
    const articleResponse = Object.entries(retval);
    console.log('articleResponse my',articleResponse)
    console.log('articleResponse my retval',retval)

    // var text_arr =[];
    // for(let k = 0 ; k < articleResponse.length ; k++){
    //   for(let i = 0 ; i < articleResponse[k] ; i++){
    //     text_arr[i] = articleResponse[k][i];
    //    }

    //  }
    // console.log('asdasdasd',text_arr)
  //   for(let i = 0 ; i < articleResponse.articles.length ; i++){
  //     text_arr [i] = articleResponse.articles[i].sentence.split(",");
  //    }

  // for(let i = 0 ; i < articleResponse.articles.length ; i++){
  //   articleResponse.articles[i].sortedData = text_arr[i]
  // }

    this.setState({
      articleData:articleResponse,
      loading:false,
      dateState:''
    })
    console.log('MY ARTICLE',this.state.articleData)
    // console.log('text_arr',text_arr)
    
    
    
  }


  async getArticleWithDate(){
    this.setState({
      loading:true
    })
    console.log('im hit')
    const dataToBeSent = {
      slug:this.state.selectedSlug,
      recent:'false',
      date:this.state.selectedDate
    }
    const url = 'https://bsa-web.herokuapp.com/get_articles';
    // const url = 'http://127.0.0.1:8000/get_articles';
    const response = await fetch(url , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify(dataToBeSent),
    });

    const articleResponse = await response.json();
    console.log(articleResponse, 'articleResponsearticleResponse');
    var text_arr =[];
    for(let i = 0 ; i < articleResponse.articles.length ; i++){
      text_arr [i] = articleResponse.articles[i].sentence.split(",");

      // articleResponse.articles.sample[i] = text_arr
  }

  for(let i = 0 ; i < articleResponse.articles.length ; i++){
    articleResponse.articles[i].sortedData = text_arr[i]
  }
    // articleResponse.articles.sample = text_arr
    this.setState({
      articleData:articleResponse.articles,
      loading:false,
      dateState:articleResponse.articles[0].date
    })
    console.log('MY ARTICLE',articleResponse)
    console.log('text_arr',text_arr)
  }
 
  search(event){
     var searchQuery = this.state.qState

     const url = `https://bsa-web.herokuapp.com/get_search/${searchQuery}`;
    //  const url = `http://127.0.0.1:8000/get_search/${searchQuery}`;
        fetch(url , {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
          }).then(res=>res.json())
          .then(res=>{
            console.log(res.articles)
            this.setState({
              temp_articles:Object.entries(res.articles),
            })
            Object.entries(res.articles).map((items, i) => {
              items[1].map((deal, idx) => { this.getArticle(deal.slug) }) 
            })
      }) 

      // this.getArticle(this.state.temp_articles.deal.slug)
      // console.log(this.state.temp_articles,"output");
      // console.log(this.state.temp_articles[0],"next");

      
      
  }
  
  changeTitle = (e) =>{
    
    this.setState({qState: e.target.value});
    
  // var searchQuery = e.target.value.toLowerCase();
  // var articleDataFilter = this.state.articles.filter((el) => {
  //     var searchValue = el[0].toLowerCase() 
  //     return searchValue.indexOf(searchQuery) !== -1 
  // });
      
  // console.log(searchQuery,'ooo', articleDataFilter, 'here')
  //  if(articleDataFilter.length === 0 ){

  //    console.log("api call will here");

  //     const url = `http://127.0.0.1:8000/get_search/${searchQuery}`;
  //     fetch(url , {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       }
  //       }).then(res=>res.json())
  //       .then(res=>{
  //         console.log(res.articles)
  //         this.setState({
  //          temp_articles:Object.entries(res.articles),
  //         })
  //     })
  //  }
  // this.setState({
  //   temp_articles: articleDataFilter
  // }); 
  }
    
  

  

  handleChange = (value) => {
    this.setState({
      selectedDate:value
    })
    console.log(this.state.selectedDate)
  }

  async onFinish (values) {
    console.log(values);
    const url = 'https://bsa-web.herokuapp.com/store_email';
    // const url = 'http://127.0.0.1:8000/store_email';
    const response = await fetch(url , {
    method: 'POST',
    headers: {
      'Content-Type': "application/json; charset=utf-8",
    },
    body:JSON.stringify({
      "email":values.email
    }),
    });
    
    const emailResponse = await response.json();
  };
  changeText = (text) => {

        this.setState({ text });
        };

   gotoLink (ele){
    let offsetTop  = document.getElementById(ele).offsetTop;
    window.scrollTo({
        top: offsetTop-100,
        behavior: "smooth"
    });
}
  return_qoute = (ingredientsDeal) => {
    return
          {Object.values(ingredientsDeal.sentence).map((itemSentence, indxx) =>
            <>{itemSentence.sentence}</>
          )}
    }
  render() {
    const { text } = this.state;
    const{ temp_articles,articles, articleData , dateArray,sidBarWidth} = this.state ;
    const resume = articles.map((items, i) => {
      return (
         <SubMenu title={items[0]}>
          {/*{React.createElement('p', {*/}
          {/*className: 'trigger',*/}
          {/*onClick: this.toggle,*/}
          {/*}, this.state.collapsed ? "Show":"Hide")}*/}

          {items[1].map((deal, idx) =>
            <Menu.Item
            onClick={() => {this.getArticle(deal.slug) ;}}
            
          >{deal.category}
          </Menu.Item>    
          )}                      
        </SubMenu>
      )
    });
    return (
      <Spin spinning={this.state.loading}>  

      <Layout classname="header">
      <Header className="header-bar">
          <div className="header-bar-logo" style={{display:'flex'}}>
           {/* <Title className="header-bar-title" size='small' level={2} href='/'>
          {React.createElement('div', {
          className: 'trigger',
          onClick: this.toggle,
          }, this.state.collapsed ? "Show Menu":"Hide")}
          </Title> */}
          <div>
          <IconButton className="togglerBtn" style={{marginLeft:'-35px',marginRight:'20px',marginTop:'-3px'}}>
            {React.createElement('div', {
          className: 'trigger',
          onClick: this.toggle,
          }, this.state.collapsed ? <MenuIcon />:<CloseIcon />)}
          </IconButton>
          </div>
          
              <a href='/'>
          <span style={{
            color:'black',
            fontSize : 28,
            fontWeight: 'bold'}}>
          Byte Size Arxiv
          </span>
          </a>
        </div>
        <div className="header-bar-menu">
          <Button className="home-button" size='medium' href='/' type='secondary'> Home </Button>
          <Button className="bsa-button" size='medium' href = '/B.S.A.' type='secondary'> B.S.A. </Button>
          <Button
            className="newsletter-button"
            size='medium'
            onClick={() => this.gotoLink('news')}
            type='secondary'
          >
            Newsletter
          </Button>
          </div>
      </Header>
      <Layout className='bsa' style={{marginTop:'60px',}}>
      <Sider className="sider siderCSS"  trigger={null} collapsible collapsed={this.state.collapsed} width={sidBarWidth}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
            }}
        className="site-layout-background">
           <input
           style={{width:'400px'}}
              name="fname"
              type="text"
              value={this.state.qState}
              onChange={this.changeTitle}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search(event)
                }
              }}
          />
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ color:'black', backgroundColor:'#FAEEDC', height: "100%", borderRight: 0,  }}
          >
          {resume}
          </Menu>
        </Sider>
        <Layout style={{ color:'black', backgroundColor:'white', padding: "0 24px 24px",marginLeft: 400  }}>
          {/* <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}
          <div style={{ padding: "30px 50px 0 50px" }}>


          </div>
     
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
                {/* {shareCount => <span className="myShareCountWrapper">{shareCount}</span>} */}
                {/* <FacebookIcon size={25}  /> */}
                <Button variant="contained" style={{padding:'0px 10px',backgroundColor:"blue"}} color="primary">Share</Button>
              </FacebookShareButton>
            </div>
            
          )} 
          </React.Fragment>
        
          )}
            </div>
          </Content>

          <Footer className="footer" id='news' >

          <Title level={2}>Interested in a weekly digest?</Title>
            Sign up for our BSA Newsletter!
          <Form name='myform' onFinish={this.onFinish}>
          <Form.Item name='email'>
          <Input

          style={{margin: '0 auto',width:'200px'}}
          placeholder="Enter Email to subscribe" />

          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={ () => { this.changeText("Submitted!")}  }> {text}
      </Button>
          </Form>

          </Footer>
        </Layout>
      </Layout>
    </Layout>
    </Spin>
    );
  }
}
 
export default CustomLayout;
