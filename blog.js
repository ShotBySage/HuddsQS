// =========================================================
// HUDDS QUEER SOCIAL
// BLOG
// =========================================================

const posts = [

  // Add new posts at the TOP of this list.
  //
  // Example:
  //
  // {
  //   date: "12 September 2026",
  //   category: "Community",
  //   title: "Your post title",
  //   excerpt: "A short description of the post.",
  //   url: "blog/example.html",
  //   image: "assets/example.jpg"
  // }

];


// =========================================================
// FORMAT DATE
// =========================================================

function formatBlogDate(dateString) {

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


// =========================================================
// BLOG LIST
// =========================================================

function loadBlogPosts() {

  const container =
    document.getElementById("blog-list");

  if (!container) return;


  if (posts.length === 0) {

    container.innerHTML = `

      <div class="blog-empty">

        No blog posts yet.

        Check back soon!

      </div>

    `;

    return;

  }


  container.innerHTML =
    posts.map(post => {

      return `

        <a
          class="blog-post"
          href="${escapeHTML(post.url)}"
        >

          ${
            post.image
              ? `
                <img
                  class="blog-post-image"
                  src="${escapeHTML(post.image)}"
                  alt=""
                >
              `
              : `
                <div
                  class="blog-post-image"
                  aria-hidden="true"
                ></div>
              `
          }


          <div class="blog-post-content">

            ${
              post.category
                ? `
                  <span class="blog-post-category">
                    ${escapeHTML(post.category)}
                  </span>
                `
                : ""
            }


            <div class="blog-post-date">

              ${formatBlogDate(post.date)}

            </div>


            <h2>

              ${escapeHTML(post.title)}

            </h2>


            <p class="blog-post-excerpt">

              ${escapeHTML(post.excerpt)}

            </p>


            <span class="blog-post-read">

              Read post →

            </span>

          </div>

        </a>

      `;

    }).join("");

}


// =========================================================
// HOMEPAGE RECENT BLOG POST
// =========================================================

function loadRecentBlogPost() {

  const container =
    document.getElementById(
      "recent-blog-post"
    );

  if (!container) return;


  if (posts.length === 0) {

    container.innerHTML = `

      <p>
        No blog posts yet.
        Check back soon!
      </p>

    `;

    return;

  }


  const post =
    posts[0];


  container.innerHTML = `

    <a
      class="blog-post"
      href="${escapeHTML(post.url)}"
    >

      ${
        post.image
          ? `
            <img
              class="blog-post-image"
              src="${escapeHTML(post.image)}"
              alt=""
            >
          `
          : ""
      }


      <div class="blog-post-content">

        ${
          post.category
            ? `
              <span class="blog-post-category">
                ${escapeHTML(post.category)}
              </span>
            `
            : ""
        }


        <div class="blog-post-date">

          ${formatBlogDate(post.date)}

        </div>


        <h2>

          ${escapeHTML(post.title)}

        </h2>


        <p class="blog-post-excerpt">

          ${escapeHTML(post.excerpt)}

        </p>


        <span class="blog-post-read">

          Read post →

        </span>

      </div>

    </a>

  `;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// =========================================================
// START
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadBlogPosts();

    loadRecentBlogPost();

  }
);
