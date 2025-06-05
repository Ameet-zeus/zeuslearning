const tweet1 = {
  username: "@moshhamedani",
  content: "I'd love to teach you HTML/CSS!",
  comments: 242,
  retweets: 242,
  likes: 2600,
  profilePicture: "/Images/pfp.PNG"
};

function formatNumber(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + "K" : num;
}

document.getElementById("tweet").innerHTML = `
  <div class="main-container">
    <div class="img-container">
      <img src="${tweet1.profilePicture}" alt="Profile picture" class="profile-pic">
    </div>
    <div class="info">
      <p class="username">${tweet1.username}</p>
      <p class="content">${tweet1.content}</p>
      <div class="stats">
        <img src="/Images/comment.svg" alt="Comments" class="icons" style="transform: scaleX(-1);">
        <p class="numbers">${tweet1.comments}</p>
        <img src="/Images/retweet.svg" alt="Retweets" class="icons">
        <p class="numbers">${tweet1.retweets}</p>
        <img src="/Images/heart.svg" alt="Likes" class="icons">
        <p class="numbers">${formatNumber(tweet1.likes)}</p>
      </div>
    </div>
  </div>
`;
