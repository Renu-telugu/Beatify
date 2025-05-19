const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });
}

let currentlyPlayingCard = null;

const playButtons = document.querySelectorAll('.play-button');
playButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.card');
        const icon = button.querySelector('i');
        
        if (currentlyPlayingCard && currentlyPlayingCard !== card) {
            const prevIcon = currentlyPlayingCard.querySelector('.play-button i');
            prevIcon.classList.remove('fa-pause');
            prevIcon.classList.add('fa-play');
            currentlyPlayingCard.classList.remove('now-playing');
            
            pauseProgressSimulation();
        }
        
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('now-playing');
            });
            
            card.classList.add('now-playing');
            currentlyPlayingCard = card;
            
            updateAlbumDisplay(card);
            startProgressSimulation();
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            
            card.classList.remove('now-playing');
            currentlyPlayingCard = null;
            
            pauseProgressSimulation();
        }
    });
});

function updateAlbumDisplay(card) {
    const albumCover = document.querySelector('.album-cover');
    const albumTitle = document.querySelector('.album-title');
    const albumArtist = document.querySelector('.album-artist');
    
    const cardImg = card.querySelector('.card-img').src;
    const cardTitle = card.querySelector('.card-title').textContent;
    const cardInfo = card.querySelector('.card-info').textContent;
    
    albumCover.src = cardImg;
    albumTitle.textContent = cardTitle;
    albumArtist.textContent = cardInfo.split('...')[0];
    
    const playerControlIcon = document.querySelector('.player-controls img:nth-child(3)');
    if (playerControlIcon) {
        playerControlIcon.setAttribute('src', './assets/player_icon3.png');
    }
    
    setupAlbumTitleAnimation();
}

const addToPlaylistButtons = document.querySelectorAll('.add-to-playlist');
addToPlaylistButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        button.style.transform = 'scale(1.3) translateY(0)';
        setTimeout(() => {
            button.style.transform = 'scale(1.1) translateY(0)';
        }, 200);
        
        alert('Added to playlist!');
    });
});

const playlistItems = document.querySelectorAll('.playlist-item');
let draggedItem = null;

playlistItems.forEach(item => {
    item.addEventListener('dragstart', function() {
        draggedItem = this;
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    });
    
    item.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedItem = null;
    });
    
    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (draggedItem !== this) {
            const container = this.parentNode;
            const afterElement = getDragAfterElement(container, e.clientY);
            
            if (afterElement == null) {
                container.appendChild(draggedItem);
            } else {
                container.insertBefore(draggedItem, afterElement);
            }
        }
    });
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.playlist-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

const progressBar = document.querySelector('.progress-bar');
const currentProgress = document.querySelector('.current-progress');
const progressBarContainer = document.querySelector('.progress-bar-container');
let progressInterval;
let isPlaying = false;

if (progressBar && currentProgress && progressBarContainer) {
    progressBar.addEventListener('input', function() {
        updateProgressBar(this.value);
    });
    
    progressBarContainer.addEventListener('click', function(e) {
        if (e.target === progressBarContainer) {
            const rect = this.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const percentage = (clickPosition / rect.width) * 100;
            
            progressBar.value = percentage;
            updateProgressBar(percentage);
        }
    });
    
    const playPauseButton = document.querySelector('.player-controls img:nth-child(3)');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', function() {
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                if (currentlyPlayingCard) {
                    startProgressSimulation();
                } else if (document.querySelector('.card')) {
                    const firstCard = document.querySelector('.card');
                    const firstPlayButton = firstCard.querySelector('.play-button');
                    if (firstPlayButton) {
                        firstPlayButton.click();
                    }
                }
            } else {
                pauseProgressSimulation();
                if (currentlyPlayingCard) {
                    const playButton = currentlyPlayingCard.querySelector('.play-button');
                    if (playButton) {
                        playButton.click();
                    }
                }
            }
        });
    }
}

function startProgressSimulation() {
    isPlaying = true;
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        let currentValue = parseInt(progressBar.value);
        currentValue = (currentValue + 1) % 101;
        
        updateProgressBar(currentValue);
        
        if (currentValue === 0) {
            playNextTrack();
        }
    }, 1000);
}

function pauseProgressSimulation() {
    isPlaying = false;
    clearInterval(progressInterval);
}

function playNextTrack() {
    if (currentlyPlayingCard) {
        const allCards = Array.from(document.querySelectorAll('.card'));
        const currentIndex = allCards.indexOf(currentlyPlayingCard);
        
        if (currentIndex !== -1 && currentIndex < allCards.length - 1) {
            const nextCard = allCards[currentIndex + 1];
            const nextPlayButton = nextCard.querySelector('.play-button');
            if (nextPlayButton) {
                nextPlayButton.click();
            }
        } else if (allCards.length > 0) {
            const firstCard = allCards[0];
            const firstPlayButton = firstCard.querySelector('.play-button');
            if (firstPlayButton) {
                firstPlayButton.click();
            }
        }
    }
}

function updateProgressBar(value) {
    progressBar.value = value;
    progressBar.style.setProperty('--progress', `${value}%`);
    currentProgress.style.width = `${value}%`;
    
    const totalSeconds = timeToSeconds('3:33');
    const currentSeconds = Math.floor(totalSeconds * (value / 100));
    document.querySelector('.current-time').textContent = secondsToTime(currentSeconds);
}

function timeToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

function secondsToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const volumeBar = document.querySelector('.volume-bar');
const volumeIcon = document.querySelector('.volume-icon');
const volumeContainer = document.querySelector('.volume-container');

if (volumeBar && volumeIcon && volumeContainer) {
    volumeBar.addEventListener('input', function() {
        updateVolumeControl(this.value);
    });
    
    volumeContainer.addEventListener('click', function(e) {
        if (e.target === volumeContainer) {
            const rect = this.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left - 20;
            const percentage = (clickPosition / 80) * 100;
            
            if (percentage >= 0 && percentage <= 100) {
                volumeBar.value = percentage;
                updateVolumeControl(percentage);
            }
        }
    });
    
    volumeIcon.addEventListener('click', function() {
        if (!volumeIcon.classList.contains('fa-volume-xmark')) {
            volumeIcon.dataset.prevVolume = volumeBar.value;
            updateVolumeControl(0);
        } else {
            const prevVolume = volumeIcon.dataset.prevVolume || 80;
            updateVolumeControl(prevVolume);
        }
    });
    
    function updateVolumeControl(value) {
        volumeBar.value = value;
        volumeBar.style.setProperty('--volume', `${value}%`);
        
        if (value == 0) {
            volumeIcon.classList.remove('fa-volume-high', 'fa-volume-low');
            volumeIcon.classList.add('fa-volume-xmark');
        } else if (value < 50) {
            volumeIcon.classList.remove('fa-volume-high', 'fa-volume-xmark');
            volumeIcon.classList.add('fa-volume-low');
        } else {
            volumeIcon.classList.remove('fa-volume-low', 'fa-volume-xmark');
            volumeIcon.classList.add('fa-volume-high');
        }
    }
}

const microphoneIcon = document.querySelector('.microphone-icon');
if (microphoneIcon) {
    microphoneIcon.addEventListener('click', function() {
        this.classList.toggle('active');
        
        if (this.classList.contains('active')) {
            this.classList.remove('fa-microphone-lines');
            this.classList.add('fa-microphone-lines-slash');
        } else {
            this.classList.remove('fa-microphone-lines-slash');
            this.classList.add('fa-microphone-lines');
        }
    });
}

const fullScreenIcon = document.querySelector('.full-screen-icon');
if (fullScreenIcon) {
    fullScreenIcon.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
            fullScreenIcon.classList.remove('fa-expand');
            fullScreenIcon.classList.add('fa-compress');
        } else {
            fullScreenIcon.classList.remove('fa-compress');
            fullScreenIcon.classList.add('fa-expand');
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !isInputFocused()) {
        e.preventDefault();
        const playPauseButton = document.querySelector('.player-controls img:nth-child(3)');
        if (playPauseButton) {
            playPauseButton.click();
        }
    }
    
    if (e.ctrlKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        const prevButton = document.querySelector('.player-controls img:nth-child(2)');
        if (prevButton) {
            prevButton.click();
            playPreviousTrack();
        }
    }
    
    if (e.ctrlKey && e.code === 'ArrowRight') {
        e.preventDefault();
        const nextButton = document.querySelector('.player-controls img:nth-child(4)');
        if (nextButton) {
            nextButton.click();
            playNextTrack();
        }
    }
    
    if (e.code === 'KeyM' && !isInputFocused()) {
        e.preventDefault();
        if (volumeIcon) {
            volumeIcon.click();
        }
    }
    
    if (e.ctrlKey && e.code === 'KeyH') {
        e.preventDefault();
        document.querySelector('.nav-option:first-child a').click();
    }
    
    if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        document.querySelector('.search-input').focus();
    }
    
    if (e.ctrlKey && e.code === 'KeyL') {
        e.preventDefault();
        document.querySelector('.lib-option a').click();
    }
    
    if (e.code === 'KeyF' && !isInputFocused()) {
        e.preventDefault();
        if (fullScreenIcon) {
            fullScreenIcon.click();
        }
    }
    
    if (e.code === 'KeyL' && !isInputFocused() && !e.ctrlKey) {
        e.preventDefault();
        if (microphoneIcon) {
            microphoneIcon.click();
        }
    }
});

function playPreviousTrack() {
    if (currentlyPlayingCard) {
        const allCards = Array.from(document.querySelectorAll('.card'));
        const currentIndex = allCards.indexOf(currentlyPlayingCard);
        
        if (currentIndex > 0) {
            const prevCard = allCards[currentIndex - 1];
            const prevPlayButton = prevCard.querySelector('.play-button');
            if (prevPlayButton) {
                prevPlayButton.click();
            }
        } else if (allCards.length > 0) {
            const lastCard = allCards[allCards.length - 1];
            const lastPlayButton = lastCard.querySelector('.play-button');
            if (lastPlayButton) {
                lastPlayButton.click();
            }
        }
    }
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
}

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
        const isPlaying = this.classList.contains('now-playing');
        
        if (!isPlaying) {
            const playButton = this.querySelector('.play-button');
            if (playButton) {
                playButton.click();
            }
        }
    });
});

document.querySelectorAll('.btn-click').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('ripple');
        setTimeout(() => {
            this.classList.remove('ripple');
        }, 600);
    });
});

function setupAlbumTitleAnimation() {
    const albumTitle = document.querySelector('.album-title');
    if (albumTitle) {
        if (albumTitle.scrollWidth > albumTitle.clientWidth) {
            albumTitle.classList.add('overflow');
        } else {
            albumTitle.classList.remove('overflow');
        }
    }
}

window.addEventListener('load', setupAlbumTitleAnimation);
window.addEventListener('resize', setupAlbumTitleAnimation);

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.classList.contains('page-transition')) {
        mainContent.classList.add('page-transition');
    }
    
    const nowPlayingCard = document.querySelector('.card.now-playing');
    if (nowPlayingCard) {
        updateAlbumDisplay(nowPlayingCard);
        currentlyPlayingCard = nowPlayingCard;
    }
});