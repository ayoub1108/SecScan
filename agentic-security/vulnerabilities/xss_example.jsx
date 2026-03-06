
// EXAMPLE: DO NOT USE IN PRODUCTION
// This is a demonstration file showing what NOT to do

import React from 'react';

// High: Cross-Site Scripting vulnerability
function CommentDisplay({ commentText }) {
  // Vulnerable to XSS
  return (
    <div className="comment">
      <div dangerouslySetInnerHTML={{ __html: commentText }} />
    </div>
  );
}

// Medium: Potential Cross-Site Scripting vulnerability
function ProfilePage({ username, bio }) {
  return (
    <div className="profile">
      <h1>{username}</h1>
      <div dangerouslySetInnerHTML={{ __html: bio }} />
    </div>
  );
}

export { CommentDisplay, ProfilePage };
