
const m = {
  profiles: document.querySelector("#profiles"),
  addProfile: document.querySelector("#add-profile"),
  query: document.querySelector("#query"),
  size: document.querySelector("#size"),
  exactField: document.querySelector("#exact-field"),
  exactWidth: document.querySelector("#exact-width"),
  exactHeight: document.querySelector("#exact-height"),
  aspectRatio: document.querySelector("#aspect-ratio"),
  color: document.querySelector("#color"),
  type: document.querySelector("#type"),
  format: document.querySelector("#format"),
  usageRights: document.querySelector("#usage-rights"),
  safeSearch: document.querySelector("#safe-search"),
  search: document.querySelector("#find"),
  clear: document.querySelector("#clear"),
  darkTheme: document.querySelector("#dark-theme"),
  github: document.querySelector("#github")
}

let state = {
  forms: [getDefaultForm()],
  index: 0,
  darkTheme: false 
}


m.query.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleSubmit()
    m.search.click()
  }
})

m.size.addEventListener("change", e => {
  syncStateFromDOM()
  syncExactSize()
})

m.search.addEventListener("click", handleSubmit)
m.clear.addEventListener("click", handleClear)
m.addProfile.addEventListener("click", () => {
  syncStateFromDOM()
  state.forms.push(getDefaultForm())
  state.index = state.forms.length - 1
  writeDOM()
})


// dark theme button
const handleDarkTheme = () => {
  state.darkTheme = !state.darkTheme
  syncDarkTheme()
  persistState()
}

m.darkTheme.addEventListener("click", handleDarkTheme)
m.darkTheme.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleDarkTheme()
  }
})

// github button
const handleGithub = () => {
  window.open(`https://github.com/polywock/advanced-image-search`, '_blank');
}

m.github.addEventListener("click", handleGithub)
m.github.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleGithub()
  }
})


function getDefaultForm() {
  return {
    query: "",
    size: "",
    aspectRatio: "",
    color: "",
    type: "",
    format: "",
    usageRights: "",
    exactWidth: "",
    exactHeight: ""
  }
}


function handleClear() {
  writeDOMForm(getDefaultForm())
  persistState()
}

function handleSubmit() {
  persistState()

  let form = readDOMForm()
  if (!form.query) return 
  let params = new URLSearchParams();
  let tbs = [];
  params.append("tbm", "isch") // search images 
  params.append("q", form.query) // search query 

  if (form.size === "qq") {
    if (form.exactWidth || form.exactHeight) {
      tbs.push(`isz:ex,iszw:${form.exactWidth || form.exactHeight},iszh:${form.exactHeight || form.exactWidth}`)
    }
  } else if (form.size) {
    
    if (form.size.length === 1) {
      tbs.push(`isz:${form.size}`)
    } else {
      tbs.push(`isz:lt,islt:${form.size}`)
    }
    
  }
  form.aspectRatio && tbs.push(`iar:${form.aspectRatio}`)

  form.color && tbs.push(`ic:${form.color}`)
  form.type && tbs.push(`itp:${form.type}`)
  form.format && tbs.push(`ift:${form.format}`)
  form.usageRights && tbs.push(form.usageRights)


  if (tbs.length > 0) {
    params.append("tbs", tbs.join(","))
  }

  window.open(`https://google.com/search?${params.toString()}`,
    '_blank'
  );
}

function syncStateFromDOM() {
  state.forms[state.index] = readDOMForm()
}

function persistState() {
  syncStateFromDOM()
  chrome.storage.local.set(state)
}

function readDOMForm() {
  return {
    query: m.query.value,
    size: m.size.value,
    aspectRatio: m.aspectRatio.value,
    color: m.color.value,
    type: m.type.value,
    format: m.format.value,
    usageRights: m.usageRights.value,
    exactWidth: m.exactWidth.value,
    exactHeight: m.exactHeight.value
  }
}

function syncDarkTheme() {
  if (state.darkTheme) {
    document.documentElement.classList.add("darkTheme")
  } else {
    document.documentElement.classList.remove("darkTheme")
  }
}

function handleProfileClick(e) {
  if (e.target.parentElement.id !== "profiles") return 
  syncStateFromDOM()
  state.index = clampIndex([...e.target.parentElement.children].filter(v => v.tagName === "BUTTON").findIndex(v => v === e.target))
  writeDOM()
}

function handleProfileDelete(e) {
  if (state.forms.length <= 1) {
    return 
  }

  syncStateFromDOM()

  const index = [...e.target.parentElement.parentElement.children].filter(v => v.tagName === "BUTTON").findIndex(v => v === e.target.parentElement)
  state.forms.splice(index, 1)
  if (state.index >= index) {
    state.index = clampIndex(state.index - 1)
  }
  writeDOM()
}


function syncProfiles() {
  m.profiles.innerHTML = ""
  Array(state.forms.length).fill(0).forEach((v, i) => {
    const b = document.createElement("button")
    b.innerText = i + 1
    if (i === state.index) {
      b.classList.add("selected")
    }

    b.addEventListener("click", handleProfileClick)
    
    if (state.forms.length > 1)  {


      const x = document.createElement("div")
      x.innerText = "X"
      x.classList.add("delete")
      x.addEventListener("click", handleProfileDelete)
      
      b.appendChild(x)
    }

    m.profiles.appendChild(b)
  })
}

function syncExactSize() {
  if (state.forms[state.index].size === "qq") {
    m.exactField.style.display = "grid" 
  } else {
    m.exactField.style.display = "none" 
  }
}

function writeDOM() {
  writeDOMForm(state.forms[state.index])
  syncDarkTheme()
  syncProfiles()
  syncExactSize()
}

function writeDOMForm(form) {
  document.querySelector("#query").value = form.query 
  document.querySelector("#size").value = form.size 
  document.querySelector("#aspect-ratio").value = form.aspectRatio
  m.color.value = form.color 
  m.type.value = form.type 
  m.format.value = form.format 
  m.usageRights.value = form.usageRights
  m.exactWidth.value = form.exactWidth
  m.exactHeight.value = form.exactHeight
}



function getStorage() {
  return new Promise((res, rej) => {
    chrome.storage.local.get(items => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError)
      } else {
        res(items)
      }
      return 
    })
  })
}

window.onload = async () => {
  let storage = await getStorage()

  if (storage.forms) {
    state.forms = storage.forms
    state.index = storage.index ?? 0
    state.darkTheme = storage.darkTheme ?? false 
  } else if (storage.form) {
    
    // migrate old version 
    state.forms = [storage.form]
    state.darkTheme = storage.form.darkTheme ?? false 
    delete storage.form.darkTheme
    chrome.storage.local.remove("form")
  }

  writeDOM()
}

setInterval(() => {
  persistState()
}, 100)


function clampIndex(v) {
  return Math.max(0, Math.min(v, state.forms.length - 1))
}