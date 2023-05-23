
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function formatDate (date) {
  let newDate = new Date(date)
  const seconds = Math.floor((Date.now() - newDate) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 60)
  let text = ''

  if (seconds < 60) text += seconds + ` ${seconds === 1 ? 'second' : 'seconds'} ago`
  else if (minutes < 60) text += minutes + ` ${minutes === 1 ? 'minute' : 'minutes'} ago`
  else if (hours < 24) text += hours + ` ${hours === 1 ? 'hour' : 'hours'} ago`
  else if (days < 365) {
    text += `${months[date.slice(5, 7) - 1]} ${date.slice(8, 10)} at ${date.slice(11, 16)}`
  } else {
    text += `${months[date.slice(5, 7) - 1]} ${date.slice(8, 10)}, ${date.slice(0, 4)} at ${date.slice(11, 16)}`
  }
  return text
}