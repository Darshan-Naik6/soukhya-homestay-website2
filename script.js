document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Gallery Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  // Fullscreen Image Modal
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModal = document.querySelector('.close-modal');

  galleryItems.forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modal.classList.add('open');
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    });
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore scrolling
  });

  // Close modal on outside click or Escape key
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  });

  // Booking Calculator Logic
  const bookingForm = document.getElementById('booking-form');
  const roomSelect = document.getElementById('b-room');
  const checkinInput = document.getElementById('b-checkin');
  const checkoutInput = document.getElementById('b-checkout');
  const adultsInput = document.getElementById('b-adults');
  const childrenInput = document.getElementById('b-children');
  const priceDisplay = document.getElementById('estimated-price');
  const errorMsg = document.getElementById('guest-error');
  const btnWa = document.getElementById('btn-wa-inq');
  
  // Prevent more than 8 guests or 6 children from being typed/entered
  if (adultsInput && childrenInput) {
    const enforceGuestLimits = (e) => {
      let adults = parseInt(adultsInput.value, 10) || 0;
      let children = parseInt(childrenInput.value, 10) || 0;
      
      // Limit children to a maximum of 6
      if (children > 6) {
        childrenInput.value = 6;
        children = 6;
      }
      
      // Limit total guests to a maximum of 8
      if (adults + children > 8) {
        if (e.target === adultsInput) {
          adultsInput.value = Math.max(0, 8 - children);
        } else if (e.target === childrenInput) {
          childrenInput.value = Math.max(0, 8 - adults);
        }
      }
    };

    adultsInput.addEventListener('input', enforceGuestLimits);
    childrenInput.addEventListener('input', enforceGuestLimits);
  }
  
  const calculatePrice = () => {
    const roomType = parseInt(roomSelect.value, 10);
    const checkin = new Date(checkinInput.value);
    const checkout = new Date(checkoutInput.value);
    const adults = parseInt(adultsInput.value, 10) || (adultsInput.value === '' ? 0 : parseInt(adultsInput.value, 10)); // keep 0 if empty/nan temp
    const children = parseInt(childrenInput.value, 10) || 0;
 
    // Validation: Limits
    const totalGuests = adults + children;
    const isInvalidGuests = totalGuests > 8 || children > 6 || adults < 1;

    const breakdown = document.getElementById('estimate-breakdown');
    const dbBadge = document.getElementById('direct-booking-badge');

    if (isInvalidGuests) {
      errorMsg.style.display = 'block';
      if(btnWa) btnWa.disabled = true;
      priceDisplay.textContent = '--';
      priceDisplay.classList.remove('has-discount');
      const disc = document.getElementById('discounted-price');
      if (disc) disc.style.display = 'none';
      if (dbBadge) dbBadge.style.display = 'none';
      if (breakdown) breakdown.textContent = '';
      return;
    } else {
      errorMsg.style.display = 'none';
      if(btnWa) btnWa.disabled = false;
    }

    // Validate dates
    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime()) || checkin >= checkout) {
      priceDisplay.textContent = '--';
      priceDisplay.classList.remove('has-discount');
      const disc = document.getElementById('discounted-price');
      if (disc) disc.style.display = 'none';
      if (dbBadge) dbBadge.style.display = 'none';
      if (breakdown) breakdown.textContent = '';
      return;
    }

    // Number of nights
    const timeDiff = checkout.getTime() - checkin.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let totalPrice = 0;
    
    // Loop through each night
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkin.getTime());
      currentDate.setDate(currentDate.getDate() + i);
      const isWeekend = (currentDate.getDay() === 5 || currentDate.getDay() === 6 || currentDate.getDay() === 0); // Fri, Sat, Sun
      
      let baseNightPrice = 0;
      let extraAdultPrice = 0;
      let childrenPrice = children * 200; // Children is flat 200/child/night for both room types

      if (roomType === 1) { // 1 Bedroom Room
        const baseAdults = Math.min(adults, 2);
        const extraAdults = Math.max(0, adults - 2);
        
        if (isWeekend) {
          baseNightPrice = baseAdults === 1 ? 1199 : 1499;
        } else {
          baseNightPrice = baseAdults === 1 ? 999 : 1299;
        }
        extraAdultPrice = extraAdults * 250;
      } else if (roomType === 2) { // 2 Bedroom Villa
        const baseAdults = Math.min(adults, 4);
        const extraAdults = Math.max(0, adults - 4);
        
        if (isWeekend) {
          baseNightPrice = baseAdults <= 3 ? 1599 : 2199;
        } else {
          baseNightPrice = baseAdults <= 3 ? 1499 : 1999;
        }
        extraAdultPrice = extraAdults * 300;
      }
      
      totalPrice += baseNightPrice + extraAdultPrice + childrenPrice;
    }

    const avgNightPrice = Math.round(totalPrice / nights);
    const disc = document.getElementById('discounted-price');
    
    if (totalPrice > 0) {
      if (breakdown) {
        breakdown.textContent = `₹${avgNightPrice.toLocaleString('en-IN')} × ${nights} night${nights > 1 ? 's' : ''}`;
      }
      priceDisplay.textContent = '₹' + totalPrice.toLocaleString('en-IN');
      priceDisplay.classList.add('has-discount');
      
      const discountedPrice = Math.round(totalPrice * 0.90);
      if (disc) {
        disc.textContent = '₹' + discountedPrice.toLocaleString('en-IN');
        disc.style.display = 'block';
      }
      if (dbBadge) {
        dbBadge.style.display = 'inline-flex';
      }
    }
  };

  // Manual Calculation Logic & Form Input Highlights
  const btnCalcFare = document.getElementById('btn-calc-fare');
  const estimateBox = document.getElementById('estimate-box');
  const validationError = document.getElementById('validation-error');
  
  const nameInput = document.getElementById('b-name');
  const phoneInput = document.getElementById('b-phone');
  
  // Clear error border on user input
  [nameInput, phoneInput, checkinInput, checkoutInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
      input.addEventListener('change', () => input.classList.remove('is-invalid'));
    }
  });

  if (btnCalcFare && bookingForm) {
    btnCalcFare.addEventListener('click', () => {
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      
      let hasError = false;
      
      [nameInput, phoneInput, checkinInput, checkoutInput].forEach(input => {
        if (input) {
          if (!input.value.trim()) {
            input.classList.add('is-invalid');
            hasError = true;
          } else {
            input.classList.remove('is-invalid');
          }
        }
      });
      
      if (hasError) {
        if(validationError) validationError.style.display = 'block';
        if(estimateBox) estimateBox.style.display = 'none';
        return;
      }
      
      if(validationError) validationError.style.display = 'none';
      calculatePrice();
      
      if (priceDisplay.textContent !== '--') {
        if(estimateBox) estimateBox.style.display = 'flex';
        estimateBox.classList.remove('fade-in');
        void estimateBox.offsetWidth; // trigger reflow
        estimateBox.classList.add('fade-in');
      } else {
        if(estimateBox) estimateBox.style.display = 'none';
      }
    });
  }

  // Form Submissions
  if (bookingForm) {

    // Form Submissions
    document.getElementById('btn-wa-inq').addEventListener('click', () => {
      const name = document.getElementById('b-name').value || 'Guest';
      const country = document.getElementById('b-country').value;
      const phone = document.getElementById('b-phone').value || '';
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const roomType = parseInt(roomSelect.value, 10);
      const roomStr = roomType === 1 ? '1 Bedroom Room' : '2 Bedroom Villa';
      const adults = adultsInput.value || 1;
      const children = childrenInput.value || 0;
      
      const disc = document.getElementById('discounted-price');
      let total = priceDisplay.textContent;
      if (disc && disc.style.display !== 'none' && disc.textContent.trim()) {
        total = disc.textContent.trim();
      }

      if (!checkin || !checkout) {
        alert('Please select Check-in and Check-out dates.');
        return;
      }

      const message = `Hello Soukhya Homestay!\n\nI would like to inquire about a booking:\nName: ${name}\nPhone: ${country} ${phone}\nRoom: ${roomStr}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${adults} Adults, ${children} Children\nEstimated Price: ${total}\n\nPlease let me know if this is available.`;
      
      window.open(`https://wa.me/918217399823?text=${encodeURIComponent(message)}`, '_blank');
    });

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const roomType = parseInt(roomSelect.value, 10);
      const name = document.getElementById('b-name').value || 'Guest';
      const email = document.getElementById('b-email').value;
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const roomStr = roomType === 1 ? '1 Bedroom Room' : '2 Bedroom Villa';
      const total = priceDisplay.textContent;

      const subject = `Booking Inquiry - ${name}`;
      const body = `Name: ${name}\nRoom: ${roomStr}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nEstimated Price: ${total}\n\nPlease reply with availability.`;
      
      window.location.href = `mailto:contact@soukhyahomestay.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  // Sticky Mobile CTA Scroll Handler
  const mobileCta = document.getElementById('mobile-cta');
  if (mobileCta) {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        mobileCta.classList.add('visible');
      } else {
        mobileCta.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once in case they refresh while scrolled down
  }
});
