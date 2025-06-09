function loadNav(){
    fetch("../component/nav.html")
    .then((Response) => Response.text())
    .then((data) => {
      document.getElementById("nav-container").innerHTML = data;
    })
    .catch((err) => console.error("Error loading Navbar: ", err));
}

window.onload = loadNav;