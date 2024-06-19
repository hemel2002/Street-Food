document.addEventListener('DOMContentLoaded', function() {
  document.querySelector(".acctype").addEventListener("change",function(){
    console.log(this.value);
    if(this.value==2)
      {
        console.log(document.querySelector(".submit").classList.add("hide"));
        var p=document.querySelector(".signup")
p.setAttribute("action","../html/signup_shop.html");
        console.log(document.querySelector(".next").classList.remove("hide"));
      }
   
      else{
        console.log(document.querySelector(".submit").classList.remove("hide"));
        console.log(document.querySelector(".next").classList.add("hide"));
      }

  });
 

});
