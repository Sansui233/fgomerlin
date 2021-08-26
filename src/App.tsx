import { useEffect, useState, useRef } from 'react';
import { withRouter, Switch, Route, Redirect, Link } from "react-router-dom";
import Layout, { Content } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { message } from 'antd';
import { Menu } from 'antd';
import { CloudDownloadOutlined, FormatPainterOutlined } from "@ant-design/icons";
import 'antd/dist/antd.css'
import './App.css';
import { parseZipDataset } from "./utils/fetchdata";
import cookies from "./lib/cookies"
import ServantList from './components/ServantList';
import ServantCard from './components/ServantCard';


export const Pages = {
  // For router
  servantList: "servants",
  itemList: "item",
  statistic: "statistic",
  // Not for router
  servantContent: "servant-content",
  itemContent: "item-content",
}

let navCurrent = Pages.servantList // header selection controller
let pageCurrent = Pages.servantList // class controller

function App(props: any) {
  const servantSiderEl = useRef<HTMLDivElement>(null);

  const [state, setState] = useState({
    navCurrent,
    pageCurrent,
    isDark: cookies.getCookie('isdark') === "true" ? true : false,
  })

  useEffect(() => {
    pageOnChange()
  }, [props.location.pathname])

  function pageOnChange() {
    const paths = window.location.pathname.split('/') // Format: ["", "servants", "100100"]
    if (paths.length === 2) {
      setState({ ...state, navCurrent: paths[1], pageCurrent: paths[1] })
    }
    if (paths.length === 3) {
      setState({ ...state, navCurrent: paths[1], pageCurrent: paths[1] })
      switch (paths[1]) {
        case Pages.servantList:
          setState({ ...state, navCurrent: paths[1], pageCurrent: Pages.servantContent })
          break;
        case Pages.itemList:
          setState({ ...state, navCurrent: paths[1], pageCurrent: Pages.itemContent })
          break;
        default:
          break;
      }
    }
  }

  function handleClickFetch() {
    return parseZipDataset().then(() => {
      message.success('成功获取远程数据');
      console.log("[ServantList] FetchData successfully");
    }).catch((err) => {
      message.error('获取远程数据失败\n 错误信息：' + err)
    })
  }


  function switchTheme() {
    document.cookie = "isdark=" + !state.isDark;
    setState({ ...state, isDark: !state.isDark })
  }

  /**
   * For Mobile view experience, do not re-render the page when click top route
   * 
   * @param topNavTarget DO NOT start with "/"
   * @returns 
   */
  function handleSubNav (topNavTarget: string){
    if (window.location.pathname.split("/")[1] === topNavTarget){
      return `${window.location.pathname}`
    }
    return `/${topNavTarget}`
  }

  /**
   * For Mobile View issue. remove top nav "current-page class"
   */
  function addCurrentOnSidebar(){
      // add class
      if (servantSiderEl.current != null) {
        servantSiderEl.current.classList.add('current-page')
      }
  }

  function removeCurrentOnSidebar (){
    if (servantSiderEl.current != null) {
      servantSiderEl.current.classList.remove('current-page')
    }
  }

  return (
    <Layout className={state.isDark ? "app dark" : "app light"}>
      <Menu className="menu" selectedKeys={[state.navCurrent]} mode="horizontal">
        <Menu.Item className="menu-item" key={Pages.servantList}>
          <Link to={handleSubNav(Pages.servantList)} onClick={addCurrentOnSidebar}>从者</Link>
        </Menu.Item>
        <Menu.Item className="menu-item" key={Pages.itemList}>
          <Link to={`/${Pages.itemList}`}>素材</Link>
        </Menu.Item>
        <Menu.Item className="menu-item" key={Pages.statistic}>
          <Link to={`/${Pages.statistic}`}>统计</Link>
        </Menu.Item>
        <div className="more-operations">
          <button className="clear-button menu-button" onClick={handleClickFetch}><CloudDownloadOutlined /></button>
          <button className="clear-button menu-button" onClick={switchTheme}><FormatPainterOutlined /></button>
        </div>
      </Menu>
      <Layout className="app-content">
        <Switch>
          <Route path={`/${Pages.servantList}`}>
            <Sider ref={servantSiderEl} className={state.pageCurrent === Pages.servantList ?"servant-sider current-page":"servant-sider"}>
              <ServantList removeTopNavCurrentClass={removeCurrentOnSidebar}/>
            </Sider>
            <Content className={state.pageCurrent === Pages.servantContent ?"servant-content current-page":"servant-content"}>
              <Route path={`/${Pages.servantList}/:id`} component={ServantCard} />
            </Content>
          </Route>
          <Route path={`/${Pages.itemList}`}>
            <div> items </div>
          </Route>
          <Route path={`/${Pages.statistic}`}>
            <div> Statistic </div>
          </Route>
          <Redirect to={`/${Pages.servantList}`} />
        </Switch>
      </Layout>
    </Layout>
  );
}

export default withRouter(App);
