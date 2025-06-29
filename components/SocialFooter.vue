<template>
    <footer class="social-footer">
      <div class="social-icons">
        <a
          v-for="(link, index) in socialLinks"
          :key="index"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          :title="link.name"
          class="social-icon"
        >
          <i :class="link.iconClass"></i>
        </a>
      </div>
    </footer>
  </template>
  
  <script>
  import '@fortawesome/fontawesome-free/css/all.css';

  export default {
    name: "SocialFooter",
    data() {
      return {
        socialLinks: [
          { name: "Instagram", url: "https://www.instagram.com/just.mike99/", iconClass: "fab fa-instagram" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .social-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #333;
    color: #fff;
  }
  
  .social-icons {
    display: flex;
    gap: 15px;
  }
  
  .social-icon {
    color: #fff;
    font-size: 1.5rem;
    transition: color 0.3s ease;
  }
  
  .social-icon:hover {
    color: #1da1f2; /* lub dowolny kolor po najechaniu, np. #0077b5 dla LinkedIn */
  }
  </style>
  