import { useEffect, useState, useRef } from 'react';
import { withRouter, Switch, Route, Redirect, Link } from "react-router-dom";
import { Content } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { message } from 'antd';
import { Menu } from 'antd';
import { CloudDownloadOutlined, FormatPainterOutlined } from "@ant-design/icons";
import 'antd/dist/antd.css'
import './App.css';
import { parseZipDataset } from "./utils/dataset-resolve";
import cookies from "./lib/cookies"
import ServantList from './pages/ServantList';
import ServantCard from './pages/ServantCard';
import ItemCategory from './pages/ItemCategory';
import ItemContents from './pages/ItemContents';
import Statistic from './pages/Statistic';


export const Pages = {
  // For router
  servantList: "servants",
  itemList: "items",
  statistic: "statistic",
  // Not for router
  servantContent: "content",
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

  async function handleClickFetch() {
    message.info('正在获取并处理数据...');
    return parseZipDataset().then(() => {
      message.success('更新数据成功');
      console.log("[App.tsx] DONE database updated");
      setTimeout(() => {
        window.location.reload()
      }, 500)
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
  function handleSubNav(topNavTarget: string) {
    if (window.location.pathname.split("/")[1] === topNavTarget) {
      return `${window.location.pathname}`
    }
    return `/${topNavTarget}`
  }

  /**
   * For Mobile View issue. remove top nav "current-page class"
   */
  function addCurrentOnSidebar() {
    // add class
    if (servantSiderEl.current != null) {
      servantSiderEl.current.classList.add('current-page')
    }
  }

  function removeCurrentOnSidebar() {
    if (servantSiderEl.current != null) {
      servantSiderEl.current.classList.remove('current-page')
    }
  }

  return (
    <div className={state.isDark ? "app dark" : "app light"}>
      <Menu className="app-menu" selectedKeys={[state.navCurrent]} mode="horizontal">
        <Menu.Item className="menu-item" key={Pages.servantList}>
          <Link to={handleSubNav(Pages.servantList)} onClick={addCurrentOnSidebar}>从者</Link>
        </Menu.Item>
        <Menu.Item className="menu-item" key={Pages.itemList}>
          <Link to={`/${Pages.itemList}/materials`}>素材</Link>
        </Menu.Item>
        <Menu.Item className="menu-item" key={Pages.statistic}>
          <Link to={`/${Pages.statistic}`}>统计</Link>
        </Menu.Item>
        <Menu.Item style={{ marginLeft: "auto" }} key="theme" className="menu-button">
          <button className="clear-button" onClick={switchTheme}><FormatPainterOutlined /></button>
        </Menu.Item>
        <Menu.Item style={{ marginRight: "10px" }} key="fetch-data" className="menu-button">
          <button className="clear-button" onClick={handleClickFetch}><CloudDownloadOutlined /></button>
        </Menu.Item>
      </Menu>
      <div className="app-content">
        <Switch>
          <Route path={`/${Pages.servantList}`}>
            <aside ref={servantSiderEl} className={state.pageCurrent === Pages.servantList ? "sider current-page" : "sider"}>
              <ServantList removeCurrentOnSidebar={removeCurrentOnSidebar} />
            </aside>
            <Content className={state.pageCurrent === Pages.servantContent ? "content current-page" : "content"}>
              <Route path={`/${Pages.servantList}/:id`} component={ServantCard} />
            </Content>
          </Route>
          <Route path={`/${Pages.itemList}`}>
            <aside ref={servantSiderEl} className={state.pageCurrent === Pages.itemList ? "item-sider current-page" : "item-sider"}>
              <ItemCategory />
            </aside>
            <Content className={state.pageCurrent === Pages.itemContent ? "content current-page" : "content"}>
              <Route path={`/${Pages.itemList}/:category`} component={ItemContents} />
            </Content>
          </Route>
          <Route path={`/${Pages.statistic}`}>
            <Statistic/>
          </Route>
          <Redirect to={`/${Pages.servantList}`} />
        </Switch>
      </div>
    </div>
  );
}

export default withRouter(App);
