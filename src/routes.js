import React from 'react';
import { Route } from 'react-router-dom';
import ArticleList from './containers/ArticleListView';
import ArticleDetail from './containers/ArticleDetailView';
import CSLGList from './containers/CSLGListView';
import About from './containers/About';
import CustomLayout from './containers/Layout';

const BaseRouter = () =>(
    <div>
        <Route path = '/B.S.A.' component = {CustomLayout} />
        <Route exact path = '/' exact={true} component = {About} />
        <Route path = '/test' component = {CSLGList} />
        <Route path = '/:articleID' component = {ArticleDetail} />
    </div>

);

export default BaseRouter;