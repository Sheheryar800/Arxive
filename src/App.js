import React, { Component } from 'react';
import BaseRouter from './routes';
import { BrowserRouter as Router } from 'react-router-dom';
import logo from './logo.svg';
import './App.scss';
import 'antd/dist/antd.css';
import CustomLayout from './containers/Layout';
import renderEmpty from 'antd/lib/config-provider/renderEmpty';
import ArticleList from './containers/ArticleListView';
import CSLGList from './containers/CSLGListView';
import axios from "axios";

class App extends Component {

  render() {
    return (
      <div className="App">
        <Router>

            <BaseRouter />

        </Router>
      </div>
    );
  }
}

export default App;
