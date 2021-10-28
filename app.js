const eventList = document.querySelector("#eventList");
const dateInput = document.querySelector("#dateInput");
const textInput = document.querySelector("#textInput");
const inputsBtn = document.querySelector("#inputsBtn");

const timeArray = [
  {
    name: "week",
    value: 1000 * 60 * 60 * 24 * 7,
  },
  {
    name: "day",
    value: 1000 * 60 * 60 * 24,
  },
  {
    name: "hour",
    value: 1000 * 60 * 60,
  },
  {
    name: "min",
    value: 1000 * 60,
  },
];

let eventArray = [];

let dateTimeFormat; // global var for timeFormat() function

let i = 0;

// -----------------------------------------
//               LOCAL STORAGE
// -----------------------------------------
if (localStorage.i) {
  i = Number(localStorage.i);
}
if (localStorage.eventArray) {
  eventArray = JSON.parse(localStorage.eventArray);
  // RE-Creation of DOM elements if a [eventArray] is already saved in localStorage
  for (let event of eventArray) {
    createEventDOM(event);
  }
}

// -----------------------------------------
//                FUNCTIONS
// -----------------------------------------
// Transform backgroundColor of [events list section] if empty
function hiddenIfEmpty(x) {
  if (x.innerHTML == "") {
    x.style.background = "transparent";
  } else {
    x.style.background = "rgba(0, 0, 0, 0.35)";
  }
}

// Transform event-text & event-date in pink color if time-event is over (== if span with the time is empty (== ""))
function pinkText(x) {
  if (x.innerHTML == "") {
    x.parentElement.children[1].style.color = "rgba(252, 84, 106, 0.9)";
    x.parentElement.children[2].style.color = "rgba(252, 84, 106, 0.9)";
  }
}

// Transform a date-string into a real date with specific format
function timeFormat(string) {
  dateTimeFormat = new Date(string).toLocaleString("default", {
    year: "numeric",
    month: "2-digit",
    weekday: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Create + Push + Save in localStorage : event-object for [eventArray] (+i)
function saveEventInArray() {
  let newObjEvent = {
    name: textInput.value,
    date: dateInput.value,
    id: i,
  };
  eventArray.push(newObjEvent);
  i++;
  // Local Storage
  localStorage.setItem("i", i);
  localStorage.setItem("eventArray", JSON.stringify(eventArray));
}

// Create DOM element (with a removeBtn addEventListener)
function createEventDOM(event) {
  const newEventDiv = document.createElement("article");

  let newEventTxtDate = document.createElement("p");
  timeFormat(event.date);
  newEventTxtDate.innerHTML = dateTimeFormat;

  let newEventTxt = document.createElement("p");
  newEventTxt.innerHTML = event.name;

  // REMOVE BTN
  let newRemoveBtn = document.createElement("button");
  newRemoveBtn.classList.add("removeBtn");
  newRemoveBtn.id = event.id;
  newRemoveBtn.addEventListener("click", (e) => {
    newEventDiv.remove(); // remove DOM elem
    hiddenIfEmpty(eventList); // set a background color
    // s/o kelian
    const offset = eventArray.findIndex((el) => el.id == e.target.id);
    if (offset !== -1) {
      console.log("found at index:", offset);
      eventArray.splice(offset, 1);
      // Local Storage
      localStorage.setItem("eventArray", JSON.stringify(eventArray));
    }
  });

  let newSpan = document.createElement("span");
  countDown(event.date, newSpan);
  event.spanHtml = newSpan;

  newEventDiv.appendChild(newRemoveBtn);
  newEventDiv.appendChild(newEventTxtDate);
  newEventDiv.appendChild(newEventTxt);
  newEventDiv.appendChild(newSpan);

  eventList.appendChild(newEventDiv);

  pinkText(event.spanHtml);
}

// Create a countDown from a specific date(date) and display it in a specific DOM elem(displayedText)
function countDown(date, displayedText) {
  let timestamp = new Date(date).getTime() - new Date().getTime();

  displayedText.innerHTML = "";

  if (timestamp < 60000 && timestamp > 0) {
    let secNbr = Math.floor(timestamp / 1000);
    if (secNbr == 0) {
      displayedText.innerHTML = "";
    } else {
      displayedText.innerHTML = secNbr + "sec";
    }
  }

  for (let item of timeArray) {
    if (timestamp >= item.value) {
      let itemQuantityInTimestamp = Math.floor(timestamp / item.value);

      displayedText.innerHTML += itemQuantityInTimestamp + item.name + " ";

      timestamp = timestamp - itemQuantityInTimestamp * item.value;
    }
  }
}

// ---------------------------------------------------------
//              APP: ADD-BTN + UPDATE-INTERVAL
// ---------------------------------------------------------
// add Btn
inputsBtn.addEventListener("click", () => {
  // Condition : if inputs have value && if dateInput value is correctly in the futur
  if (
    dateInput.value &&
    textInput.value &&
    new Date(dateInput.value).getTime() > new Date().getTime()
  ) {
    // Create + Push event-elem in eventArray
    saveEventInArray();
    // Create DOM elements for this event-elem and
    createEventDOM(eventArray[eventArray.length - 1]);
    hiddenIfEmpty(eventList); // set a background color
    // Reset inputs values
    dateInput.value = "";
    textInput.value = "";
  }
});

// Interval for update all spans(event-timers) and set pink text if time is over
const intervalSpansUpdate = setInterval(() => {
  for (let event of eventArray) {
    countDown(event.date, event.spanHtml);
    pinkText(event.spanHtml);
  }
}, 1000);

// set a background color
hiddenIfEmpty(eventList);
