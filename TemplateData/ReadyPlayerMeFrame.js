
rpmHideButton.onclick = function () {
    if (document.fullscreenElement) {
        canvasWrapper.requestFullscreen();
    }
    rpmContainer.style.display = "none";
};


function setupRpmFrame(subdomain) {

    //we set the src url for the iFrame
    rpmFrame.src = `https://${subdomain != "" ? subdomain : "demo"}.readyplayer.me/avatar?frameApi`;

    //we add an event listener and bind it to a subscribe function so we can handle all events that the Ready Player Me website sends
    window.addEventListener("message", subscribe);
    document.addEventListener("message", subscribe);

    function subscribe(event) {
        //used to filter the events so that we only handle valid events 
        const json = parse(event);
        console.log("only valid events")
        console.log(json)
        if (
            unityGame == null ||
            json?.source !== "readyplayerme" ||
            json?.eventName == null
        ) {
            return;
        }
        // Send web event names to Unity can be useful for debugging. Can safely be removed
        unityGame.SendMessage(
            "DebugPanel",
            "LogMessage",
            `Event: ${json.eventName}`
        );

        // Subscribe to all events sent from Ready Player Me once frame is ready
        if (json.eventName === "v1.frame.ready") {
            rpmFrame.contentWindow.postMessage(
                JSON.stringify({
                    target: "readyplayerme",
                    type: "subscribe",
                    eventName: "v1.**",
                }),
                "*"
            );
        }

        // Get avatar GLB URL
        if (json.eventName === "v1.avatar.exported") {
            rpmContainer.style.display = "none";
            // Send message to a Gameobject in the current scene
            unityGame.SendMessage(
                "WebAvatarLoader", // Target GameObject name
                "OnWebViewAvatarGenerated", // Name of function to run
                json.data.url
            );
            console.log(`Avatar URL: ${json.data.url}`);
        }

        // Get user id
        if (json.eventName === "v1.user.set") {
            console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
        }
    }

    function parse(event) {
        try {
            return JSON.parse(event.data);
        } catch (error) {
            return null;
        }
    }
}

function showRpm() {
    rpmContainer.style.display = "block";
}

function hideRpm() {
    rpmContainer.style.display = "none";
}
