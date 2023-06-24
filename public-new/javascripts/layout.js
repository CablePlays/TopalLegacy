window.addEventListener("load", () => {

  /* Logo */

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "/";
  });

  /* Search */

  const searchInput = document.getElementById("search-input");

  function search() {
    const query = searchInput.value.trim();

    if (query.length > 0) {
      window.location.href = "/search?query=" + query;
    }
  }

  searchInput.addEventListener("keydown", e => {
    if (e.key == "Enter") {
      search();
    }
  });

  document.getElementById("search-icon").addEventListener("click", search);
});