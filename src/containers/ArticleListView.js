import React from "react";
import Articles from "../components/Articles";
import axios from "axios";

class ArticleList extends React.Component {
  state = {
    articles: [],
    nm: [],
  };
  //Method called everytime a component is mounted
  componentDidMount() {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "XCSRF-TOKEN";
    axios.get("http://127.0.0.1:8000/api/").then((res) => {
      this.setState({
        articles: res.data,
      });
      console.log(res.data);
    });

  }

  render() {
    return <Articles data={this.state.articles} />;
  }
}

export default ArticleList;
