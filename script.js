document.addEventListener("DOMContentLoaded", function () {
    const albumTitle = document.querySelector(".album-title");
    const albumInfo = document.querySelector(".album-info");

    if (albumTitle.scrollWidth > albumInfo.clientWidth) {
        albumTitle.classList.add("overflow"); // Apply animation only if overflowing
    }
});