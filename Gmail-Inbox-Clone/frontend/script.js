const mailContainer = document.getElementById("mailContainer");
const mailTabsContainer = document.getElementById("mailTabs");

let allMails = [];

async function fetchMails() {
  try {
    const response = await fetch("http://localhost:8000/api/mail/getAll");
    const mails = await response.json();
    console.log(mails);
    allMails = mails;
    showMails(allMails, "primary");
  } catch (error) {
    mailContainer.innerHTML = `<p>Error fetching mails: ${error.message}</p>`;
  }
}

function showMails(mails, filterCategory = "primary") {
  mailContainer.innerHTML = "";

  const filteredMails = mails
    .filter(mail => (mail.type?.toLowerCase() || "primary") === filterCategory)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filteredMails.length === 0) {
    mailContainer.innerHTML = `<p>No mails found in ${filterCategory}.</p>`;
    return;
  }

  filteredMails.forEach(mail => {
    const mailElement = buildMail(mail);
    mailContainer.appendChild(mailElement);
  });
}

function buildMail(mail) {
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

  mailElement.innerHTML = `
      <div class="mail-left">
      <div class="left_hover"><img src="icons/drag_indicator.png"/></div>
      <input type="checkbox" class="mail-checkbox" ${mail.selected ? "checked" : ""} />
      <div class="star-icon" data-id="${mail._id}">
      <img src="${mail.starred ? 'icons/starred-gold.png' : 'icons/unstarred.png'}" />
      </div>
      <img src="icons/label_important.png"/>
      <div class="mail-sender">${mail.sender || "No Sender"}</div>
      </div>
      <div class="mail-content">
      <div class="mail-subject">${mail.subject || "(No Subject)"}</div>
      <div class="mail-snippet">${mail.body || "No Mails"}</div>
      </div>
      <div class="mail-date">${formatDate(mail.createdAt)}</div>
      <div class="hover_icons">
      <img src="icons/right_1.png"/>
      <img class="delete-icon" data-id="${mail._id}" src="icons/right_2.png"/>
      <img class="read-icon" data-id="${mail._id}" src="icons/right_3.png"/>
      <img src="icons/right_4.png"/>
      </div>
    `;

  mailElement.addEventListener("click", async () => {
    if (mail.status === "unseen") {
      try {
        const res = await fetch(`http://localhost:8000/api/mail/read/${mail._id}`, {
          method: "PATCH",
        });
        if (res.ok) {
          mail.status = "seen";
          mailElement.classList.remove("unread");
          mailElement.classList.add("read");
          updateNotifications();
        }
        else {
          const errorText = await res.text();
          console.error(`Failed to mark mail as read: ${res.status} - ${errorText}`);
        }
      } catch (error) {
        console.error("Failed to mark mail as read:", error);
      }
    }
  });

  const checkbox = mailElement.querySelector(".mail-checkbox");
  checkbox.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    mail.selected = isChecked;
    mailElement.setAttribute("data-selected", isChecked ? "Yes" : "No");
    mailElement.classList.toggle("selected", isChecked);
    updateNotifications();
  });

  const starIcon = mailElement.querySelector(".star-icon");
  starIcon.addEventListener("click", async (e) => {
    try {
      e.stopPropagation();
      const response = await fetch(`http://localhost:8000/api/mail/star/${mail._id}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error (${response.status}): ${text}`);
      }
      const updatedMail = await response.json();
      mail.starred = updatedMail.email.starred;
      const starImg = starIcon.querySelector("img");
      starImg.src = mail.starred ? "icons/starred-gold.png" : "icons/unstarred.png";
    } catch (err) {
      console.error("Failed to update star:", err);
    }
  });

  const deleteIcon = mailElement.querySelector(".delete-icon");
  deleteIcon.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this email?")) return;
    try {
      await fetch(`http://localhost:8000/api/mail/delete/${mail._id}`, {
        method: "DELETE"
      });
      allMails = allMails.filter(m => m._id !== mail._id);
      const currentTab = mailTabsContainer.querySelector(".tab-button.active")?.getAttribute("data-category") || "primary";
      showMails(allMails, currentTab);
      updateNotifications();
    } catch (err) {
      console.error("Failed to delete mail:", err);
    }
  });

  const readIcon = mailElement.querySelector(".read-icon");

  readIcon.addEventListener("click", async (e) => {
    e.stopPropagation()
    if (mail.status === "seen") return;
    try {
      const res = await fetch(`http://localhost:8000/api/mail/read/${mail._id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        mail.status = "seen";
        mailElement.classList.remove("unread");
        mailElement.classList.add("read");
        updateNotifications();
      } else {
        const text = await res.text();
        throw new Error(`Failed to mark as read: ${res.status} - ${text}`);
      }
    } catch (err) {
      console.error("Error marking mail as read", err);
    }
  });

  return mailElement;
}

function updateNotifications() {
  const counts = allMails.reduce((unreadCounts, mail) => {
    const type = (mail.type || "primary").toLowerCase();
    if (mail.status !== "seen") {
      unreadCounts[type] = (unreadCounts[type] || 0) + 1;
    }
    return unreadCounts;
  }, {});

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
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  else {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
}

mailTabsContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab-button")) return;
  mailTabsContainer.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  const category = e.target.getAttribute("data-category");
  showMails(allMails, category);
});

async function initApp() {
  await fetchMails();
  updateNotifications();
}

initApp();

