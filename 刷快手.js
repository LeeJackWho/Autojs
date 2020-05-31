"auto";
className("android.widget.TextView").text("快手极速版").findOne().click();

while(true){
  className("android.view.View").clickable(true).selected(true).findOne().click();
  sjsj=random(10000,15000);
  sleep(sjsj);
}