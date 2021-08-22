import { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect, Link } from "react-router-dom";
import Layout, { Content } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { message } from 'antd';
import 'antd/dist/antd.css'
import './App.css';
import { parseZipDataset } from "./data/utils";
import { Menu } from 'antd';
import ServantList from './components/ServantList';
import { CloudDownloadOutlined } from "@ant-design/icons";
import ServantCard from './components/ServantCard';

function App() {

  const [state, setState] = useState({
    current: "servant"
  })

  const handleClick = e => {
    // TODO 路由
    console.log('click ', e);
    setState({ current: e.key });
  };

  function handleClickFetch() {
    return parseZipDataset().then(() => {
      message.success('成功获取远程数据');
      console.log("[ServantList] FetchData successfully");
    }).catch((err) => {
      message.error('获取远程数据失败\n 错误信息：' + err)
    })
  }

  return (
    <BrowserRouter>
      <Layout className="App">
        <section className="header">
          <Menu className="nav-menu" onClick={handleClick} selectedKeys={[state.current]} mode="horizontal">
            <Menu.Item key="servant">
              <Link to="/servant">从者</Link>
            </Menu.Item>
            <Menu.Item key="sucai">
              <Link to="/items">素材</Link>
            </Menu.Item>
            <Menu.Item key="statistic">
              <Link to="/statistic">统计</Link>
            </Menu.Item>
          </Menu>
          <button className="clear-button" onClick={handleClickFetch}><CloudDownloadOutlined /></button>
        </section>
        <Layout>
          <Switch>
            <Route path='/servant'>
              <Sider>
                <ServantList />
              </Sider>
              <Content>
                <Route path='/servant/:id' component={ServantCard}>
                  
                </Route>
              </Content>
            </Route>
            <Redirect to="/servant" />
          </Switch>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
