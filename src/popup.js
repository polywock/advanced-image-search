

const findElem = document.querySelector("#find")

findElem.addEventListener("click", handleSubmit)

function handleSubmit() {
  let form = readForm()
  let params = new URLSearchParams();
  let tbs = [];
  params.append("tbm", "isch") // search images 
  params.append("q", form.query) // search query 

  if (form.size) {
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
    query: document.querySelector("#query").value,
    size: document.querySelector("#size").value,
    aspectRatio: document.querySelector("#aspect-ratio").value,
    color: document.querySelector("#color").value,
    type: document.querySelector("#type").value,
    format: document.querySelector("#format").value,
    safeSearch: document.querySelector("#safe-search").checked,
    usageRights: document.querySelector("#usage-rights").value
  }
}

function writeForm(form) {
  document.querySelector("#query").value = form.query 
  document.querySelector("#size").value = form.size 
  document.querySelector("#aspect-ratio").value = form.aspectRatio
  document.querySelector("#color").value = form.color 
  document.querySelector("#type").value = form.type 
  document.querySelector("#format").value = form.format 
  document.querySelector("#safe-search").checked = form.safeSearch
  document.querySelector("#usage-rights").value = form.usageRights 
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
}, 50)

