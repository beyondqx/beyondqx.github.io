import React from 'react';
import { getSiteConfig } from '../utils/data';

function Footer() {
  const config = getSiteConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container px-4">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{config.title}</h4>
            <p>{config.subtitle}</p>
          </div>
          
          <div className="footer-section">
            <h4>快速链接</h4>
            <p>
              <a href="/">首页</a><br />
              <a href="/category/tech-tutorial">技术教程</a><br />
              <a href="/category/life">生活随笔</a>
            </p>
          </div>
          
          <div className="footer-section">
            <h4>联系方式</h4>
            {config.social.github && (
              <p>
                <a href={config.social.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </p>
            )}
            {config.social.twitter && (
              <p>
                <a href={config.social.twitter} target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </p>
            )}
            {config.social.email && (
              <p>
                <a href={`mailto:${config.social.email}`}>
                  {config.social.email}
                </a>
              </p>
            )}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} {config.author}. 
            Powered by React & GitHub Pages.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
