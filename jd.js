var generalSleep = 2000;//一般任务的浏览时间（非8秒任务)
var intervalSleep = 800;//任务间的间隔时间
var checkTimes = 2000;//每个任务需要检查有没有跳转成功
var randomVal = 500; //随机睡眠的区间跨度,比如generalSleep,则generalSleep随机睡眠为random(generalSleep,generalSleep+randomVal)
//如果想让上面三个参数不使用随机睡眠,randomVal请设置为0
function getTaskList()
{
    返回任务中心();
    var taskList = textMatches(/.+\([0-9]+\/[0-9]+\).*/).untilFind();
    return taskList;
}
function getGoButton(task)
{
    var father = task.parent();
    if(father == null) return null;
    father = father.parent();
    if(father == null) return null;
    var selector = text("去完成");
    var goOn = father.findOne(selector);
    return goOn;
}
function getSelectedTask(keywordList)
{
    var taskList = getTaskList(),found;
    for(var i = 0; i < taskList.length; i ++){
        found = true;
        for(var j = 0; j < keywordList.length; j ++){
            if(taskList[i].text().indexOf(keywordList[j]) == -1){
                found = false;
                break;
            }
        }
        if(found) return taskList[i];
    }
    return null;
}
function 返回()
{
    var goBack = clickable(true).desc("返回").findOne(1000);
    goBack == null ? back() : goBack.click();
}
function 返回任务中心()
{
    var 任务中心 ;
    while(true){
        任务中心 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne(1000);
        if(任务中心 != null) break;
        返回();
        sleep(1000);
    }
}
function 逛店铺(秒数)
{
    textMatches(/.+人关注/).waitFor();
    var 完成 = textContains("恭喜完成").findOne(秒数*1000);
    返回任务中心();
    sleep(random(intervalSleep,intervalSleep+randomVal));
}
function 浏览商品(次数)
{
    var goodsList = textMatches(/¥[0-9]+\.[0-9]+/).untilFind(),cnt = 0,finished = false;
    for(var i = 0; i < goodsList.length; i ++){
        if(cnt >= 次数){
            finished = true;
            break;
        }
        if(forceClick(goodsList[i]))
        {
            log("准备浏览价格为 %s 的商品",goodsList[i].text());
            cnt ++;
            textMatches(/(?:加入购物车|立即购买|立即抢购|支付定金|购物车|客服)/).waitFor();
            sleep(random(1500,2000));
            back();
            textMatches(/.*浏览.*商品.*/).waitFor();
            sleep(random(300,500));
        }
    }
    sleep(random(500,1000));
    返回任务中心();
    sleep(random(intervalSleep,intervalSleep+randomVal));
    return finished;
}
function 加购商品()
{
    var goodsList = textMatches(/¥[0-9]+\.[0-9]+/).untilFind(),finished = false,已完成,father,selector;
    for(var i = 0; i < goodsList.length; i ++){
        已完成 = text("已完成").findOnce();
        if(已完成!=null) {
            log("已完成本轮加购");
            break;
        }
        father = goodsList[i].parent().parent();
        selector = clickable(true).filter(function(w){
            var b = w.bounds(),b_ = father.bounds();
            return Math.abs(b.bottom - b_.bottom) <= 150 && Math.abs(b.right - b_.right) <= 150 
                    && b.width() <= 150 && b.height() <= 150;
        });
        加购 = father.findOne(selector);
        if(加购!=null){
            加购.click();
            log("正在加购 %s 的商品",goodsList[i].text());
            sleep(random(1000,1500));
        }
    }
    sleep(random(500,1000));
    返回任务中心();
    sleep(random(intervalSleep,intervalSleep+randomVal));
    return finished;
}
function 浏览任务自动化()
{
    log("准备进行 浏览 任务！！！");
    var isRun,taskList,goOn,txt,reg = /(?:浏览8秒|逛8秒|去玩|浏览可得|8秒得)/,恭喜完成,任务首页;
    while(true){
        taskList = getTaskList(); isRun = false;
        for(var i = 0; i < taskList.length; i ++){
            txt = taskList[i].text();
            if(reg.test(txt)){
                if(txt.indexOf("AR") != -1) continue;
                goOn = getGoButton(taskList[i]);
                if(goOn != null){
                    log(txt);
                    goOn.click();
                    sleep(checkTimes);
                    任务首页 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne(200);
                    if(任务首页 == null){
                        if(txt.indexOf("8秒")!= null) {
                            恭喜完成 = textContains("恭喜完成").findOne(random(12000,15000));
                            if(恭喜完成 != null){
                                sleep(random(300,600));
                            }
                        }
                        else sleep(random(generalSleep,generalSleep+randomVal));
                        返回任务中心();
                        sleep(random(intervalSleep,intervalSleep+randomVal));
                        isRun = true;
                        break;
                    }
                    else{
                        log("任务跳转不成功...");
                        sleep(500);
                    }
                }
            }
        }
        if(!isRun) break;
    }
    log("浏览 任务完成~~~");
    return isRun;
}
function 任务自动化(keywordList)
{
    log("准备进行 %s 任务！！！",keywordList);
    var task,last_rate=-1,curr_rate,tag_rate,reg_rate = /\([0-9]+\/[0-9]+\)/,reg,arr,sec;
    var isRun = false,任务首页,maxTryTimes = 10,tryTimes = 0,goOn,isFail;
    while(true){
        task = getSelectedTask(keywordList);
        if(task == null) break;
        arr = task.text().match(reg_rate);
        arr = toIntArr(arr[0]);
        curr_rate = parseInt(arr[0]);
        tag_rate = parseInt(arr[1]);
        if(curr_rate == tag_rate) break;
        if(curr_rate != last_rate){
            log("当前已完成 %d 次任务,目标是完成 %d 次任务,准备进行下一轮任务",curr_rate,tag_rate);
            log(task.text());
            isFail = false;
            if(keywordList[0] == "店铺"){
                reg = /[0-9]+秒/;
                arr = task.text().match(reg);
                sec = toInt(arr[0]);
                log("逛店铺 %s 秒",sec);
                goOn = getGoButton(task);
                if(goOn != null) goOn.click();
                sleep(checkTimes);
                任务首页 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne(200);
                if(任务首页 == null){
                    逛店铺(sec);
                }
                else isFail = true;
            }
            else if (keywordList[0] == "浏览" && keywordList[1] == "商品")
            {
                reg = /[0-9]+个商品/;
                arr = task.text().match(reg);
                times = toInt(arr[0]);
                log("本轮需要浏览 %s 个商品",times);
                goOn = getGoButton(task);
                if(goOn != null) goOn.click();
                sleep(checkTimes);
                任务首页 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne(200);
                if(任务首页 == null){
                    浏览商品(times);
                }
                else isFail = true;
            }
            else if (keywordList[0] == "加购" && keywordList[1] == "商品"){
                reg = /[0-9]+个商品/;
                arr = task.text().match(reg);
                times = toInt(arr[0]);
                log("本轮需要加购 %s 个商品",times);
                goOn = getGoButton(task);
                if(goOn != null) goOn.click();
                sleep(checkTimes);
                任务首页 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne(200);
                if(任务首页 == null ){
                    加购商品(times);
                }
                else isFail = true;
            }
            if(isFail){
                log("任务跳转不成功...");
                tryTimes++;
                if(tryTimes >= maxTryTimes){
                    log("超过尝试次数,放弃本轮任务");
                    break;
                }
                sleep(500);
            }
            else{
                isRun = true;  last_rate = curr_rate;  tryTimes = 0;
            }
            sleep(300);
        }
        else{
            sleep(2000);
            last_rate = curr_rate - 1;
        }
        sleep(300);
    }
    log("%s 任务完成~~~",keywordList);
    if(isRun) sleep(random(2000,2500));
    return isRun;
}
function clickObj(obj)
{
    if(obj != null && obj != undefined){
        if(obj.clickable()){
            obj.click();
        }
        else{
            click(obj.bounds().centerX(),obj.bounds().centerY());
        }
        return true;
    }
    return false;
}
function toIntArr(str)
{
    return str.match(/[0-9]+/g);
}
function toInt(str)
{
    var res = str.match(/[0-9]+/g);
    return parseInt(res[0]);
}
function forceClick(obj)
{
    for(var i = 0 ; i < 8; i ++){
        if(obj == null) return false;
        if(obj.clickable()){
            obj.click();
            return true;
        }
        else obj = obj.parent();
    }
    return false;
}
function openJD()
{
    app.startActivity({ 
        data: "openApp.jdMobile://virtual?params=%7B%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fbunearth.m.jd.com%2FbabelDiy%2FZeus%2F3xAU77DgiPoDvHdbXUZb95a7u71X%2Findex.html%22%2C%22category%22%3A%22jump%22%2C%22sourceType%22%3A%22JSHOP_SOURCE_TYPE%22%2C%22sourceValue%22%3A%22JSHOP_SOURCE_VALUE%22%2C%22M_sourceFrom%22%3A%22lkyl%22%2C%22msf_type%22%3A%22click%22%2C%22m_param%22%3A%7B%22m_source%22%3A%220%22%2C%22event_series%22%3A%7B%7D%2C%22jda%22%3A%22177095863.1664140455.1538579865.1572975960.1572979455.472%22%2C%22usc%22%3A%22androidapp%22%2C%22ucp%22%3A%22t_335139774%22%2C%22umd%22%3A%22appshare%22%2C%22utr%22%3A%22CopyURL%22%2C%22jdv%22%3A%22177095863%7Candroidapp%7Ct_335139774%7Cappshare%7CCopyURL%7C1572882675599%22%2C%22ref%22%3A%22https%3A%2F%2Fbunearth.m.jd.com%2FbabelDiy%2FZeus%2F3xAU77DgiPoDvHdbXUZb95a7u71X%2Findex.html%22%2C%22psn%22%3A%221664140455%7C472%22%2C%22psq%22%3A5%2C%22pc_source%22%3A%22%22%2C%22mba_muid%22%3A%221664140455%22%2C%22mba_sid%22%3A%221572979455588510925986537476%22%2C%22std%22%3A%22MO-J2011-1%22%2C%22par%22%3A%22%22%2C%22event_id%22%3A%22Mnpm_ComponentApplied%22%2C%22mt_xid%22%3A%22%22%2C%22mt_subsite%22%3A%22%22%7D%2C%22SE%22%3A%7B%22mt_subsite%22%3A%22%22%2C%22__jdv%22%3A%22177095863%7Candroidapp%7Ct_335139774%7Cappshare%7CCopyURL%7C1572882675599%22%2C%22__jda%22%3A%22177095863.1664140455.1538579865.1572975960.1572979455.472%22%7D%7D",
    });
}
function signIn()
{
    var 立即签到 = textMatches(/(?:立即签到|签到)/).findOne(25*1000);
    clickObj(立即签到);
}
function goToHall()
{
    var hall = text("做任务领金币").findOne(25*1000);
    clickObj(hall);
}
var notifyClose = textContains("通知权限");
var continueFloaty = text("继续叠蛋糕");
var cakeNotify = textContains("继续叠蛋糕 分红包");
var closeList = [[notifyClose,false],[continueFloaty,true],[cakeNotify,true]];//true表示直接点击
function closeFloaty()
{
    var i,obj,cancel;
    while(true){
        for(i in closeList){
            obj = closeList[i][0].findOnce();
            if(obj != null){
                if(closeList[i][1]){
                    clickObj(obj);
                }else{
                    cancel = textMatches(/(?:取消|关闭)/).findOnce();
                    if(cancel != null){
                        cancel.click();
                    }
                }
            }
        }
        sleep(100);
    }
}
// function closeHall()
// {
//     sleep(500);
//     var menu = desc("更多菜单").className("ImageView").clickable(true).findOne();
//     var 中心 = textContains("任务每日0点刷新，记得每天都来看看哦~").findOne();
//     var closeBtn = clickable(true).depth(中心.depth()+1).filter(function(w){
//         var b = w.bounds(),b_ = menu.bounds(),b__ = 中心.bounds();
//         return w.text().length == 0 &&  b_.left <= b.centerX()  && b.centerX() <= b_.right && 
//                 b.centerY() < b__.top-50 && b.centerY() > b_.bottom+50;
//     }).findOne();
//     closeBtn.click()
// }
function closeHall()
{
    back();
    sleep(1500);
    openJD();
    text("做任务领金币").waitFor();
}
function collectCoin()
{
    log("开始点击小精灵！！！");
    text("做任务领金币").waitFor();
    var elf;
    while(true){
        elf = text("点我得金币").findOne(3500);
        if(elf == null) break;
        // click(elf.bounds().centerX(),elf.bounds().top - 50);
        forceClick(elf);
        sleep(random(350,550));
    }
    log("完成小精灵收集金币");
}
function makeCake()
{
    log("开始自动叠蛋糕！！！");
    var make,closeBtn,arr,property,need,obj;
    while(true){
        obj = textMatches(/[0-9]+\/[0-9]+/).findOne();
        arr = toIntArr(obj.text());
        property = parseInt(arr[0]), need = parseInt(arr[1]);
        if(property >= need){
            log("当前拥有 %d 个金币,下一层蛋糕需要 %d 个金币,可以继续叠蛋糕",property,need);
            make = textMatches(/当前金币[0-9]+.*叠蛋糕/).clickable(true).findOne();
            sleep(200);
            make.click();
            sleep(1500);
            closeBtn = textContains("继续叠蛋糕 分红包").findOne();
            sleep(200);
            closeBtn.click();
            sleep(1500);
        }
        else {
            log("当前拥有 %d 个金币,下一层蛋糕需要 %d 个金币,已经不能继续叠蛋糕了",property,need);
            break;
        }
    }
    log("叠蛋糕完成！！！");
}
function keyListen()
{
    events.observeKey();
    events.onKeyDown("volume_down", function(event){
        exit();
    });
}
function main()
{
    console.show();
    textContains("任务每日0点刷新，记得每天都来看看哦~").waitFor();
    var flag,ret;
    while(true){
        flag = false;
        ret = 任务自动化(["店铺"]);
        sleep(500);
        if(ret) flag = true;
        ret = 任务自动化(["浏览","商品"]);
        sleep(500);
        if(ret) flag = true;
        ret = 任务自动化(["加购","商品"]);
        sleep(500);
        if(ret) flag = true;
        ret = 浏览任务自动化();
        sleep(500);
        if(ret) flag = true;
        if(!flag) break;
    }
    closeHall();
    collectCoin();
    makeCake();
    threads.start(function(){
        log("所有自动化任务已完成");
        alert("所有自动化任务已完成");
    });
    sleep(500);
    exit();
}
openJD();
threads.start(signIn);
threads.start(goToHall);
threads.start(closeFloaty);
threads.start(keyListen);
main();