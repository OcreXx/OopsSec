import React from 'react';

export default function Header(){
  return (
    <header>
      <nav className="navbar global-nav">
        <a href="/" className="nav-logo" id="nav-logo">AppSec in a Nutshell</a>
        <ul>
          <li><a href="/websecurity/" id="web-security-link">Web Security</a></li>
          <li><a href="/devsecops/" id="devsecops-link">DevSecOps</a></li>
          <li><a href="/" aria-disabled>Design and Security</a></li>
        </ul>
      </nav>
    </header>
  );
}

