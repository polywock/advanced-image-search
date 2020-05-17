
const m = {
  query: document.querySelector("#query"),
  size: document.querySelector("#size"),
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



m.query.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    persistForm(readForm())
    m.search.click()
  }
})

m.search.addEventListener("click", handleSubmit)
m.clear.addEventListener("click", handleClear)


// dark theme button
const handleDarkTheme = () => {
  if (m.darkTheme.classList.contains("active")) {
    m.darkTheme.classList.remove("active")
    document.documentElement.classList.remove("darkTheme")
  } else {
    m.darkTheme.classList.add("active")
    document.documentElement.classList.add("darkTheme")
  }

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
    safeSearch: false,
    usageRights: "",
    exactWidth: "",
    exactHeight: ""
  }
}

function handleClear() {
  writeForm(getDefaultForm())
}

function handleSubmit() {
  let form = readForm()
  if (!form.query) return 
  let params = new URLSearchParams();
  let tbs = [];
  params.append("tbm", "isch") // search images 
  params.append("q", form.query) // search query 

  if (form.exactWidth || form.exactHeight) {
    tbs.push(`isz:ex,iszw:${form.exactWidth || form.exactHeight},iszh:${form.exactHeight || form.exactWidth}`)
  } else {
      if (form.size) {
        if (form.size.length === 1) {
          tbs.push(`isz:${form.size}`)
        } else {
          tbs.push(`isz:lt,islt:${form.size}`)
        }
      }

      form.aspectRatio && tbs.push(`iar:${form.aspectRatio}`)
  }

  form.color && tbs.push(`ic:${form.color}`)
  form.type && tbs.push(`itp:${form.type}`)
  form.format && tbs.push(`ift:${form.format}`)
  form.usageRights && tbs.push(`sur:${form.usageRights}`)


  if (tbs.length > 0) {
    params.append("tbs", tbs.join(","))
  }

  if (form.safeSearch) {
    params.append("safe", "active")
  } else {
    params.append("safe", "images")
  }


  window.open(`https://google.com/search?${params.toString()}`,
    '_blank'
  );
}

function readForm() {
  return {
    query: m.query.value,
    size: m.size.value,
    aspectRatio: m.aspectRatio.value,
    color: m.color.value,
    type: m.type.value,
    format: m.format.value,
    safeSearch: m.safeSearch.checked,
    usageRights: m.usageRights.value,
    exactWidth: m.exactWidth.value,
    exactHeight: m.exactHeight.value,
    darkTheme: m.darkTheme.classList.contains("active")
  }
}

function writeForm(form) {
  document.querySelector("#query").value = form.query 
  document.querySelector("#size").value = form.size 
  document.querySelector("#aspect-ratio").value = form.aspectRatio
  m.color.value = form.color 
  m.type.value = form.type 
  m.format.value = form.format 
  m.safeSearch.checked = form.safeSearch
  m.usageRights.value = form.usageRights
  m.exactWidth.value = form.exactWidth
  m.exactHeight.value = form.exactHeight
  if (form.darkTheme) {
    m.darkTheme.classList.add("active")
    document.documentElement.classList.add("darkTheme")
  }
}

function persistForm(form) {
  chrome.storage.local.set({ form })
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
  if (storage.form) {
    writeForm(storage.form)
  }
}

setInterval(() => {
  persistForm(readForm())
}, 100)

