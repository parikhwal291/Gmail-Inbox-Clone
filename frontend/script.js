const mailContainer = document.getElementById("mailContainer");
const mailTabsContainer = document.getElementById("mailTabs");

let allMails = [];

async function fetchMails() {
  try {
    const response = await fetch("http://localhost:8000/api/mail/getAll");
    const mails = await response.json();
    console.log(mails);
    allMails = mails;
    displayMails(allMails, "primary");
  } catch (error) {
    mailContainer.innerHTML = `<p>Error fetching mails: ${error.message}</p>`;
  }
}

function displayMails(mails, filterCategory = "primary") {
  mailContainer.innerHTML = ""; // Clear existing mails

  const filteredMails = mails.filter(
    mail => (mail.type?.toLowerCase() || "primary") === filterCategory
  );

  if (filteredMails.length === 0) {
    mailContainer.innerHTML = `<p>No mails found in ${filterCategory}.</p>`;
    return;
  }

  filteredMails.forEach(mail => {
    const mailElement = createMailElement(mail);
    mailContainer.appendChild(mailElement);
  });
}

function createMailElement(mail) {
  const mailElement = document.createElement("div");
  mailElement.classList.add("mail-item");
  mailElement.classList.add(mail.status === "seen" ? "read" : "unread");
  mailElement.setAttribute("data-hover", "Yes");

  if (mail.selected) {
    mailElement.setAttribute("data-selected", "Yes");
    mailElement.classList.add("selected");
  } else {
    mailElement.setAttribute("data-selected", "No");
  }

  const formattedDate = formatDate(mail.createdAt);

  mailElement.innerHTML = `
      <div class="mail-left">
      <div class="left_hover"><img src="icons/drag_indicator.png"/></div>
      <input type="checkbox" class="mail-checkbox" ${mail.selected ? "checked" : ""} />
      <div class="star-icon"><img src="${mail.starred ? 'icons/starred-gold.png' : 'icons/unstarred.png'}"/></div>
      <div class="star-icon"><img src="icons/label_important.png"/></div>
      <div class="mail-sender">${mail.sender || "No Sender"}</div>
      </div>
      <div class="mail-content">
      <div class="mail-subject">${mail.subject || "(No Subject)"}</div>
      <div class="mail-snippet">${mail.body || "No Mails"}</div>
      </div>
      <div class="mail-date">${formatDate(mail.createdAt)}</div>
      <div class="hover_icons">
      <img src="icons/right_1.png"/>
      <img src="icons/right_2.png"/>
      <img src="icons/right_3.png"/>
      <img src="icons/right_4.png"/>
      </div>
    `;

  const checkbox = mailElement.querySelector(".mail-checkbox");
  checkbox.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    mail.selected = isChecked;

    mailElement.setAttribute("data-selected", isChecked ? "Yes" : "No");
    mailElement.classList.toggle("selected", isChecked);

    // Optionally update read/unread status here
    // mail.status = isChecked ? "seen" : "unseen";

    updateNotificationCounts();
  });

  return mailElement;
}

function updateNotificationCounts() {
  // Count unread mails per type
  const counts = allMails.reduce((acc, mail) => {
    const type = (mail.type || "primary").toLowerCase();
    if (mail.status !== "seen") {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  // Update counts in tab buttons
  mailTabsContainer.querySelectorAll(".tab-button").forEach(btn => {
    const category = btn.getAttribute("data-category");
    const count = counts[category] || 0;
    const badge = btn.querySelector(".notification-count");

    if (count > 0) {
      badge.textContent = `${count} new`;
      badge.style.display = "inline-block";
    } else {
      badge.textContent = "";
      badge.style.display = "none";
    }
  });
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    // Same day: show time
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  else {
    // Show Month Day
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
}

// Tab buttons event listener to filter mails
mailTabsContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab-button")) return;

  // Remove active class from all buttons
  mailTabsContainer.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));

  // Add active to clicked button
  e.target.classList.add("active");

  const category = e.target.getAttribute("data-category");
  displayMails(allMails, category);
});

fetchMails();
updateNotificationCounts();
