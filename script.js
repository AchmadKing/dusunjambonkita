// Target launching date: July 24, 2026, at 23:59:00 (Local Time)
// Note: Month in Javascript Date constructor is 0-indexed (0 = Jan, 6 = July)
const targetDate = new Date(2026, 6, 24, 23, 59, 0).getTime();

// Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const titleEl = document.querySelector('.main-title');
const subtitleEl = document.querySelector('.subtitle');
const alertEl = document.querySelector('.target-date-alert');

function formatNumber(num) {
    return num < 10 ? '0' + num : num;
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        // Countdown is finished
        clearInterval(countdownInterval);
        
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';

        // Update titles to announce launch
        titleEl.textContent = "Website Telah Diluncurkan!";
        subtitleEl.innerHTML = "Selamat datang! Kami telah resmi meluncurkan portal website. Terima kasih atas kesabaran Anda! 🚀";
        if (alertEl) {
            alertEl.style.display = 'none';
        }
        return;
    }

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Apply text updates
    daysEl.textContent = formatNumber(days);
    hoursEl.textContent = formatNumber(hours);
    minutesEl.textContent = formatNumber(minutes);
    secondsEl.textContent = formatNumber(seconds);
}

// Initial call
updateCountdown();

// Update countdown every 1 second
const countdownInterval = setInterval(updateCountdown, 1000);

// Network Status Alert (Offline Check)
document.addEventListener('DOMContentLoaded', () => {
    const offlineBanner = document.getElementById('offlineBanner');
    const closeOfflineBtn = document.getElementById('closeOfflineBtn');

    if (offlineBanner) {
        const checkNetworkStatus = () => {
            if (!navigator.onLine) {
                offlineBanner.classList.add('show');
            } else {
                offlineBanner.classList.remove('show');
            }
        };

        window.addEventListener('offline', () => {
            offlineBanner.classList.add('show');
        });

        window.addEventListener('online', () => {
            offlineBanner.classList.remove('show');
        });

        if (closeOfflineBtn) {
            closeOfflineBtn.addEventListener('click', () => {
                offlineBanner.classList.remove('show');
            });
        }

        // Run initial check
        checkNetworkStatus();
    }
});
