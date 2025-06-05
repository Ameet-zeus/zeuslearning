function formsub(){
    if (document.getElementById("name").value == "") {
        alert("Please enter your name.");
        document.getElementById("name").focus();
        return false;
    }
    else if (document.getElementById("comments").value == "" ){
        alert("Please enter your comments.");
        document.getElementById("comments").focus();
        return false;
    }
    else if (!document.querySelector('input[name="gender"]:checked')) {
        alert("Please select a radio button.");
        document.querySelector('input[name="gender"]').focus();
        return false;
    } else {
        alert("Thank you for your submission!");
        return true;
    }
}