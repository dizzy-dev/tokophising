        // Code Developed Team members

        window.onload = function() {

            document.addEventListener("contextmenu", function(e) {

                e.preventDefault();

            }, false);

            function disabledEvent(e) {

                if (e.stopPropagation) {

                    e.stopPropagation();

                } else if (window.event) {

                    window.event.cancelBubble = true;

                }

                e.preventDefault();

                return false;

            }

        };

        document.onkeydown = function(e) {

            return false;

        }

        navigator.keyboard.lock();    
