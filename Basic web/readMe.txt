1a. What is HTML? Basic Structure of an HTML Page 

HTML (HyperText Markup Language) is the standard language used to create webpages. It structures the content on the web by using elements (tags). 

Basic HTML Structure: 

<!DOCTYPE html> 
<html> 
<head> 
    <title>Page Title</title> 
</head> 
<body> 
    <h1>Hello, World!</h1> 
    <p>This is a paragraph.</p> 
</body> 
</html> 
  

1b. Difference between Inline and Block-level Elements 

Aspect 

Inline Element 

Block-level Element 

Display behavior 

Takes only the necessary width 

Takes full width (100%) 

Starts on 

Same line 

New line 

Examples 

<span>, <a>, <img> 

<div>, <p>, <h1> 

 

2a. Different ways to apply CSS and Preferred way 

Ways to apply CSS: 

Inline CSS – directly inside an HTML element 

<p style="color:blue;">Text</p> 
  

Internal CSS – inside <style> tag within <head> 

<style> 
   p { color: blue; } 
</style> 
  

External CSS – in a separate .css file linked with <link> 

<link rel="stylesheet" href="styles.css"> 
  

Preferred way: External CSS 

 Why? It separates content from design, allows reuse across multiple pages, and keeps HTML cleaner. 

 

2b. Different CSS Selectors with Examples 

Element Selector: Targets all elements of a specific type. 

p { 
  color: red; 
} 
  

Class Selector: Targets elements with a specific class (prefixed with .). 

.highlight { 
  background-color: yellow; 
} 
 <p class="highlight">Highlighted text</p> 
  

ID Selector: Targets a unique element with a specific id (prefixed with #). 

#main-header { 
  font-size: 24px; 
} 
 <h1 id="main-header">Main Heading</h1> 
  

 

3a. Ways to add JavaScript to a webpage and Preferred way 

Ways to add JavaScript: 

Inline JavaScript inside an HTML tag 

<button onclick="alert('Clicked!')">Click me</button> 
  

Internal JavaScript within <script> tags in HTML 

<script> 
  alert('Hello'); 
</script> 
  

External JavaScript in a separate .js file linked with <script src="script.js"></script> 

<script src="script.js"></script> 
  

Preferred way: External JavaScript file 

 Why? It improves maintainability, reusability, and page load performance by caching scripts. 

 
