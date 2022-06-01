/*** API ***/

async function auth(email, password, tfa) {
  const res = await fetch(`https://kessel-api.parsecgaming.com/v1/auth`, {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      email,
      password,
      tfa,
    }),
  });

  return await res.json();
}

async function serverList(sessionId) {
  const res = await fetch(`https://kessel-api.parsecgaming.com/hosts/`, {
    method: "get",
    headers: {
      Authorization: "Bearer " + sessionId,
    },
  });

  return await res.json();
}

async function sendEmulatorId(emulatorid) {
  const response = await fetch(
    "https://4zajz92r2i.execute-api.us-west-2.amazonaws.com/staging/session",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emulatorId: emulatorid,
      }),
    }
  );
  // console.log(response)
  return await response.json();
}

async function shutdown(){
  const response = fetch("https://4zajz92r2i.execute-api.us-west-2.amazonaws.com/staging/session/" + localStorage.sessionId,{
    method: "delete",
  })
  return await response.json
}

async function getEmulators() {
  const res = await fetch(
    "https://4zajz92r2i.execute-api.us-west-2.amazonaws.com/staging/emulator",
    {
      method: "get",
    }
  );
  return await res.json();
}

/*** BROWSER EVENTS ***/

let RELATIVE = false;
let BLOCK_NEXT_ESC = false;

const KEYMAP = {
  KeyA: 4,
  KeyB: 5,
  KeyC: 6,
  KeyD: 7,
  KeyE: 8,
  KeyF: 9,
  KeyG: 10,
  KeyH: 11,
  KeyI: 12,
  KeyJ: 13,
  KeyK: 14,
  KeyL: 15,
  KeyM: 16,
  KeyN: 17,
  KeyO: 18,
  KeyP: 19,
  KeyQ: 20,
  KeyR: 21,
  KeyS: 22,
  KeyT: 23,
  KeyU: 24,
  KeyV: 25,
  KeyW: 26,
  KeyX: 27,
  KeyY: 28,
  KeyZ: 29,
  Digit1: 30,
  Digit2: 31,
  Digit3: 32,
  Digit4: 33,
  Digit5: 34,
  Digit6: 35,
  Digit7: 36,
  Digit8: 37,
  Digit9: 38,
  Digit0: 39,
  Enter: 40,
  Escape: 41,
  Backspace: 42,
  Tab: 43,
  Space: 44,
  Minus: 45,
  Equal: 46,
  BracketLeft: 47,
  BracketRight: 48,
  Backslash: 49,
  Semicolon: 51,
  Quote: 52,
  Backquote: 53,
  Comma: 54,
  Period: 55,
  Slash: 56,
  CapsLock: 57,
  F1: 58,
  F2: 59,
  F3: 60,
  F4: 61,
  F5: 62,
  F6: 63,
  F7: 64,
  F8: 65,
  F9: 66,
  F10: 67,
  F11: 68,
  F12: 69,
  PrintScreen: 70,
  ScrollLock: 71,
  Pause: 72,
  Insert: 73,
  Home: 74,
  PageUp: 75,
  Delete: 76,
  End: 77,
  PageDown: 78,
  ArrowRight: 79,
  ArrowLeft: 80,
  ArrowDown: 81,
  ArrowUp: 82,
  NumLock: 83,
  NumpadDivide: 84,
  NumpadMultiply: 85,
  NumpadEnter: 86,
  NumpadPlus: 87,
  NumpadMinus: 88,
  Numpad1: 89,
  Numpad2: 90,
  Numpad3: 91,
  Numpad4: 92,
  Numpad5: 93,
  Numpad6: 94,
  Numpad7: 95,
  Numpad8: 96,
  Numpad9: 97,
  Numpad0: 98,
  NumpadPeriod: 99,
  ContextMenu: 101,
  ControlLeft: 224,
  ShiftLeft: 225,
  AltLeft: 226,
  MetaLeft: 227,
  ControlRight: 228,
  ShiftRight: 229,
  AltRight: 230,
  MetaRight: 231,
};

function attachBrowserEvents(parsec, element) {
  // Buttons
  const mouseButton = (event) => {
    const pressed = event.type === "mousedown";
    let button = 0;

    if (!document.pointerLockElement) {
      if (RELATIVE) event.target.requestPointerLock();
    }

    if (pressed && event.button === 0 && event.ctrlKey && event.shiftKey) {
      event.target.requestPointerLock();
      return;
    }

    switch (event.button) {
      case 0:
        button = 1;
        break;
      case 1:
        button = 2;
        break;
      case 2:
        button = 3;
        break;
      case 3:
        button = 4;
        break;
      case 4:
        button = 5;
        break;
    }

    parsec.clientSendMessage({
      type: 2,
      button: button,
      pressed: !!pressed,
    });
  };

  element.addEventListener("mousedown", mouseButton);
  element.addEventListener("mouseup", mouseButton);

  // Context Menu
  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  // Mouse Motion
  element.addEventListener("mousemove", (event) => {
    let relative = 0;
    let x = 0;
    let y = 0;

    if (document.pointerLockElement) {
      relative = 1;
      x = event.movementX;
      y = event.movementY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    parsec.clientSendMessage({
      type: 4,
      relative: !!relative,
      x: x * window.devicePixelRatio,
      y: y * window.devicePixelRatio,
    });
  });

  // Relative Mouse Mode
  document.addEventListener("pointerlockchange", () => {
    if (!document.pointerLockElement && !BLOCK_NEXT_ESC) {
      // Since escape stop pointerlock and is not passed through, pass it through
      const msg = {
        type: 1,
        code: Enum.Scancodes["Escape"],
        mod: 0,
        pressed: true,
      };

      parsec.clientSendMessage(msg);

      msg["pressed"] = false;
      parsec.clientSendMessage(msg);
    }

    BLOCK_NEXT_ESC = false;
  });

  // Wheel
  element.addEventListener(
    "wheel",
    (event) => {
      parsec.clientSendMessage({
        type: 3,
        x: event.deltaX * -1,
        y: event.deltaY * -1,
      });
    },
    { passive: true }
  );

  // Keyboard
  const keyboard = (event) => {
    const code = KEYMAP[event.code];

    if (code) {
      event.preventDefault();

      let keymod = 0;

      if (event.shiftKey) keymod |= 0x0001 | 0x0002;

      if (event.ctrlKey) keymod |= 0x0040 | 0x0080;

      if (event.altKey) keymod |= 0x0100 | 0x0200;

      if (event.metaKey) keymod |= 0x0400 | 0x0800;

      if (event.getModifierState("NumLock")) keymod |= 0x1000;

      if (event.getModifierState("CapsLock")) keymod |= 0x2000;

      parsec.clientSendMessage({
        type: 1,
        code: code,
        mod: keymod,
        pressed: event.type == "keydown",
      });
    }
  };

  window.addEventListener("keyup", keyboard);
  window.addEventListener("keydown", keyboard);
}

/*** GAMEPAD API ***/

let GP_STATE = {};

const GPMAP = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 9,
  5: 10,
  8: 4,
  9: 6,
  10: 7,
  11: 8,
  12: 11,
  13: 12,
  14: 13,
  15: 14,
};

function getAxisValue(value) {
  return value > 0 ? value * 32767 : value * 32768;
}

function enableGamepads(parsec) {
  setInterval(() => {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < 4; i++) {
      if (gamepads[i]) {
        let gp = GP_STATE[i];

        if (!gp) gp = GP_STATE[i] = { axes: [], buttons: [] };

        for (let x = 0; x < gamepads[i].buttons.length; x++) {
          const value = gamepads[i].buttons[x].value;

          if (gp.buttons[x] !== undefined && gp.buttons[x] !== value) {
            if (x === 6 || x === 7) {
              //triggers
              parsec.clientSendMessage({
                type: 6,
                axis: x - 2,
                id: i,
                value: getAxisValue(value),
              });
            } else {
              //other buttons
              const mapped = GPMAP[x];

              if (mapped !== undefined) {
                parsec.clientSendMessage({
                  type: 5,
                  button: mapped,
                  id: i,
                  pressed: value ? true : false,
                });
              }
            }
          }

          gp.buttons[x] = value;
        }

        for (let x = 0; x < gamepads[i].axes.length; x++) {
          let val = gamepads[i].axes[x];
          if (Math.abs(val) < 0.05) val = 0;

          if (gp.axes[x] !== undefined && gp.axes[x] !== val) {
            parsec.clientSendMessage({
              type: 6,
              axis: x,
              id: i,
              value: getAxisValue(val),
            });
          }

          gp.axes[x] = val;
        }
      } else if (GP_STATE[i]) {
        delete GP_STATE[i];

        parsec.clientSendMessage({
          type: 7,
          id: i,
        });
      }
    }
  }, 20);
}

/*** CURSOR HANDLING ***/

let CURSOR_CACHE = {};
let CURSOR_CLASS = null;
let CURSOR_ID = 0;

function handleCursor(parsec, msg, element) {
  element.style.cursor = !msg["cursor"]["hidden"] ? "" : "none";
  RELATIVE = msg["cursor"]["relative"];

  if (RELATIVE) {
    element.requestPointerLock();
  } else {
    if (document.pointerLockElement) {
      BLOCK_NEXT_ESC = true;
      document.exitPointerLock();
    }
  }

  if (msg["cursor"]["imageUpdate"]) {
    const buffer = parsec.getBuffer(msg["key"]);
    const data = btoa(String.fromCharCode(...buffer));
    const hotX = msg["cursor"]["hotX"];
    const hotY = msg["cursor"]["hotY"];

    if (!CURSOR_CACHE[data]) {
      CURSOR_CACHE[data] = `cursor-x-${CURSOR_ID}`;

      const style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML =
        `.cursor-x-${CURSOR_ID++} ` +
        `{cursor: url(data:image/png;base64,${data}) ${hotX} ${hotY}, auto;}`;
      document.querySelector("head").appendChild(style);
    }

    if (CURSOR_CLASS) element.classList.remove(CURSOR_CLASS);

    element.classList.add(CURSOR_CACHE[data]);
    CURSOR_CLASS = CURSOR_CACHE[data];
  }
}

/*** UI & PARSEC CLIENT CONNECTION ***/

async function getSessionId(emulatorid) {
  try {
    debugger;
    var json = await sendEmulatorId(emulatorid);
    if (json.body.sessionId) {
      localStorage.sessionId = json.body.sessionId;
      window.location.reload();
    } else {
      console.log(json);
    }
  } catch (e) {
    console.log(e);
  }
}

async function emulatorTable() {
console.log('table time')
  var table = document.getElementById("emulator-list");
  var json = await getEmulators();
  for (var i = 0; i < json.body.length; i++) {
    var row = `<tr>
					<td>${json.body[i].id}</td>
					<td>${json.body[i].name}</td>
					<td><button onclick="getSessionId('${json.body[i].id}')">Spin Up</button></td>
				</tr>`;
    table.innerHTML += row;
  }
}

function deletesever(){
  shutdown()
}

async function serverTable(sessionId) {
  const json = await serverList(sessionId);
//   debugger;
  const table = _("#server-list");
  for (const server of json.data) {
    const tr = addRow(table);
    addTextCol(tr, server.name);
    addTextCol(tr, server.build);
    addTextCol(tr, server.peer_id);
    addTextCol(tr, server.user_name);
    addButtonCol(tr, "Connect", async () => {
      const container = _(".video-container");
      container.style.display = "block";
      table.style.display = "none";

      // Parsec instance and client connection
      const parsec = new Parsec(_("video"), _("audio"), container);
      parsec.clientConnect(sessionId, server.peer_id, "");

      // Attach browser window events to the SDK
      attachBrowserEvents(parsec, container);

      // Enable the browser gamepad API
      enableGamepads(parsec);

      // Client status polling interval
      const interval = setInterval(() => {
        const status = parsec.clientGetStatus();

        if (
          status != parsec.Status.PARSEC_CONNECTING &&
          status != parsec.Status.PARSEC_OK
        ) {
          parsec.clientDisconnect();
          parsec.destroy();

          table.style.display = "table";
          container.style.display = "";

          if (status !== 0) alert(`Exit code: ${status}`);

          clearInterval(interval);
        }

        // Handle cursor events -- other events can also be handled here
        for (let evt; (evt = parsec.clientPollEvents()); ) {
          if (evt.type == 1) handleCursor(parsec, evt, container);
        }
      }, 100);
    });
  }

  const tr = addRow(table);
  addButtonCol(tr, "Logout", () => {
    deletesever()
    delete localStorage.sessionId;
	  delete localStorage.connected
    window.location.reload();
  });
}



async function connect() {
  console.log('connecting')
//   console.log(connected)
  try {
    const json = await getEmulators();
    if (json != null) {
      localStorage.connected = true
	  window.location.reload();
    }
  } catch (e) {
    console.log(e);
  }
}

async function submit() {
  try {
    const email = _("#email").value;
    const password = _("#password").value;
    const tfa = _("#tfa").value;

    const json = await auth(email, password, tfa);
    debugger;

    if (json.session_id) {
      localStorage.sessionId = json.session_id;
      window.location.reload();
    } else {
      console.log(json);
    }
  } catch (e) {
    console.log(e);
  }
}

function logout(){
	localStorage.clear()
	console.log('logging out')
  localStorage.connected = false
	window.location.reload();
}

function _(selector) {
  return document.querySelector(selector);
}

function addRow(table) {
  const tr = document.createElement("tr");
  table.appendChild(tr);
  return tr;
}

function addTextCol(tr, text) {
  const td = document.createElement("td");
  td.textContent = text;
  tr.appendChild(td);
}

function addButtonCol(tr, text, onclick) {
  const td = document.createElement("td");
  tr.appendChild(td);

  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = onclick;
  td.appendChild(button);
}

function UI() {
  // _("#emulator-list").style.display = "table";
  if (localStorage.sessionId != null) {
    _("#server-list").style.display = "table";
    _("#auth").style.display = "none";
    _("#emulator-list").style.display = "none";
    // _("#logout").style.display = "table";
    serverTable(localStorage.sessionId);
  } else if (localStorage.connected) {
    _("#auth").style.display = "none";
    _("#server-list").style.display = "none";
    _("#emulator-list").style.display = "table";
    // _("#logout").style.display = "table";
    emulatorTable();
  } else {
    _("#server-list").style.display = "none";
    _("#auth").style.display = "table";
    _("#emulator-list").style.display = "none";
    // _("#logout").style.display = "none";
  }
}
