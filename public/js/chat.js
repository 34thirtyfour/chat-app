const socket = io();

//Elements
const $messageForm = document.querySelector('#message_form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send_location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message_template').innerHTML;
const locationMessageTemplate = document.querySelector('#location_template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML;
//Options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild;

    //Height of the  new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message',(message)=>{
    
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('locationMessage',(message)=>{
    
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData',({ room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.message.value;
    $messageFormInput.value = '';
    $messageFormInput.focus();
    socket.emit('sendMessage',message,()=>{
        console.log('Message was delivered');
    });
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location Shared!'); 
         });
    })
    
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
})