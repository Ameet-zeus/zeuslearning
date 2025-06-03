function formsub(){
    if (document.getElementById("name").value == "") {
        alert("Please enter your name.");
        return false;
    }
    else if (document.getElementById("comments").value == "" ){
        alert("Please enter your comments.");
        return false;
    }
    else if (!document.querySelector('input[name="gender"]:checked')) {
        alert("Please select a radio button.");
        return false;
    } else {
        alert("Thank you for your submission!");
        return true;
    }
}