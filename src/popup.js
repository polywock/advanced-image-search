
const m = {
  profiles: document.querySelector("#profiles"),
  addProfile: document.querySelector("#add-profile"),
  query: document.querySelector("#query"),
  size: document.querySelector("#size"),
  exactWidth: document.querySelector("#exact-width"),
  exactHeight: document.querySelector("#exact-height"),
  aspectRatio: document.querySelector("#aspect-ratio"),
  color: document.querySelector("#color"),
  type: document.querySelector("#type"),
  format: document.querySelector("#format"),
  usageRights: document.querySelector("#usage-rights"),
  region: document.querySelector("#region"),
  date: document.querySelector("#date"),
  minDate: document.querySelector("#min-date"),
  maxDate: document.querySelector("#max-date"),
  search: document.querySelector("#find"),
  clear: document.querySelector("#clear"),
  darkTheme: document.querySelector("#dark-theme"),
  github: document.querySelector("#github"),
  cSize: document.querySelector("#cSize"),
  cDate: document.querySelector("#cDate")
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

m.size.addEventListener("change", handleConditionalField)
m.date.addEventListener("change", handleConditionalField)

function handleConditionalField(e) {
  syncStateFromDOM()
  syncConditionalFields()
}


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
    exactHeight: "",
    date: "",
    minDate: "",
    maxDate: "", 
    region: ""
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
  form.region && params.append("cr", `country${form.region}`)

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

  if (form.date === "qq") {
    let minDate = reformatDate(form.minDate)
    let maxDate = reformatDate(form.maxDate)

    if (minDate || maxDate) {
      tbs.push(`cdr:1,cd_min:${minDate},cd_max:${maxDate}`)
    }
    alert(`cdr:1,cd_min:${minDate},cd_max:${maxDate}`)
  } else if (form.date) {
    tbs.push(`qdr:${form.date}`)
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

function reformatDate(date) {
  if (!date) return ""
  const [y, m, d] = date.split("-")
  return [m, d, y].join("/")
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
    exactHeight: m.exactHeight.value,
    date: m.date.value,
    minDate: m.minDate.value,
    maxDate: m.maxDate.value,
    region: m.region.value
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

function syncConditionalFields() {
  // exact size 
  if (state.forms[state.index].size === "qq") {
    m.cSize.style.display = "grid" 
  } else {
    m.cSize.style.display = "none" 
  }

  if (state.forms[state.index].date === "qq") {
    m.cDate.style.display = "grid" 
  } else {
    m.cDate.style.display = "none" 
  }
}

function writeDOM() {
  writeDOMForm(state.forms[state.index])
  syncDarkTheme()
  syncProfiles()
  syncConditionalFields()
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
  m.date.value = form.date ?? ""
  m.minDate.value = form.minDate ?? ""
  m.maxDate.value = form.maxDate ?? "" 
  m.region.value = form.region ?? ""
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
    state.forms[0].usageRights = ""
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