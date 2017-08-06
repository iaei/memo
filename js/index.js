(function () {
    let memo = {
        LOCAL_STORAGE_KEY: "iaei-memos",


        init() {
            this.items = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY)) || [];
            this.index = null;
            this.$memo = document.querySelector("#memo");
            this.$memo.addEventListener("click", this);



            this.$item = document.querySelectorAll(".item");
            this.$items = document.querySelector(".items");
            this.$newItem = document.querySelector("#newItem");
            this.$title = document.querySelectorAll(".title")
            this.$detail = document.querySelectorAll(".detail");

            this.$editor = document.querySelector("#editor");
            this.$edTitle = document.querySelector("#edTitle");
            this.$edDetail = document.querySelector("#edDetail");


            this.render();
        },

        handleEvent(event) {
            let target = event.target;
            switch (true) {
                case target.matches("#newItem"):
                    this.clear();
                    this.editor();
                    break;
                case target.matches(".dp"):
                    this.view(event);
                    break;
                case target.matches(".save"):
                    this.save();
                    break;
                case target.matches(".close"):
                    this.home();
                    break;
                // case target.matches(".title"):
                //     this.pullDown();
                //     break;
            }
        },

        render() {
            this.$items.innerHTML = this.items.map(function (item, index) {
                return `<div class = "itemWrap" data-index="${index}">
                            <div class= "item" data-index="${index}">
                                <div class = "title" ">
                                    <p>${item.title}</p>
                                    <div class="deadLine">25days</div>
                                </div>
                            </div>
                        </div>
                        `
            }).join('');
            this.$detail = document.querySelectorAll(".detail");
        },

        home() {
            this.$editor.style.transform = 'scale(0, 0)';
            this.$memo.style.overflow = 'visible';
        },

        clear() {
            this.index = null;
            this.$edTitle.value = null;
            this.$edDetail.value = null;
        },

        editor() {
            this.$editor.style.transform = 'scale(1,1)';
            this.$memo.style.overflow = 'hidden';
        },

        save() {
            if ((this.$edTitle.value.length > 0 || this.$edDetail.value.length > 0) && this.index === null) {
                this.items.push({ title: this.$edTitle.value, detail: this.$edDetail.value });
            } else {
                this.home();
            }

            if (this.index !== null) {
                this.items[this.index].title = this.$edTitle.value;
                this.items[this.index].detail = this.$edDetail.value;
            }
            this.storage();
            this.render();
            this.home();
        },

        storage() {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.items));
        },

        view() {
            this.index = event.target.parentElement.parentElement.getAttribute('data-index');
            this.$edTitle.value = this.items[this.index].title;
            this.$edDetail.value = this.items[this.index].detail;
            this.editor();
        },

        // pullDown() {
        //     this.index = event.target.parentElement.dataset.index;
        //     let cHeight = getComputedStyle(this.$detail[this.index]).height;
        //     if (cHeight === '0px') {
        //         this.$detail[this.index].style.height = "auto";
        //     } else {
        //         this.$detail[this.index].style.height = "0";
        //     }

        // },


        gesture() {
            let self = this;


            let startHandler = function (event) {
                self.countNum = 0;
                // event.prototype.count = function(){
                //     self.c++;
                // }
                if (isItem()) {
                    self.target = event.target;
                    self.slideItem = event.target.parentElement;
                }
                self.startX = event.touches[0].pageX;
                self.startY = event.touches[0].pageY;
                self.offsetX = 0;
                self.startTime = +new Date();

            };

            let moveHandler = function (event) {
                event.count = function () {
                    return self.countNum++;
                }();
                //event.count();
                console.log(self.countNum);
                self.offsetX = event.touches[0].pageX - self.startX;
                self.offsetY = event.touches[0].pageY - self.startY;
                self.angle = +Math.atan2(self.offsetY, self.offsetX) / Math.PI * 180;
                moveDirection();
                console.log(self.moveDirection);
                if (isItem() && self.moveDirection === "td") {
                    event.preventDefault();
                    self.slideItem.style.transform = `translate3d(${self.offsetX}px,0,0)`;
                }
            };

            let endHandler = function (event) {

                self.endTime = +new Date();
                self.touchTime = self.endTime - self.startTime;
                let boundary = window.innerWidth / 3;
                if (self.offsetX !== 0 && isItem()) {
                    self.slideItem.style.transition = "all .5s";
                    // if (self.touchTime > 800) {  
                    if (self.offsetX >= boundary) {
                        go("1");
                        // del();               
                    } else if (self.offsetX < -boundary) {
                        go("-1");
                        // del();
                    } else {
                        go("0");

                    }
                    // }else {
                    //     if(self.offsetX>=50){
                    //         go("1");
                    //        // del();
                    //     }else if(self.offsetX<-50){
                    //         go("-1");
                    //         //del();
                    //     }else {
                    //         go("0");

                    //     }
                    // }
                }
            };

            // let defaultEvent = function(){
            //   return 
            // };


            let moveDirection = function () {
                if (self.countNum === 1) {
                    if (self.angle > -45 && self.angle < 45 || self.angle < -135 || self.angle > 135) {
                        self.moveDirection="td";
                        return;//横向滑动 transverse direction
                    } else {
                        self.moveDirection="md";
                        return;//纵向滑动 machine direction
                    }
                }


            };

            let go = function (dir) {

                switch (dir) {
                    case "1":
                        self.slideItem.style.transform = `translate3d(${window.innerWidth}px,0,0)`;
                        break;
                    case "-1":
                        self.slideItem.style.transform = `translate3d(-${window.innerWidth}px,0,0)`;
                        break;
                    case "0":
                        self.slideItem.style.transform = `translate3d(0,0,0)`;
                        break;
                }
            };

            let del = function () {
                self.slideItem.addEventListener("webkitTransitionEnd", function () {
                    self.slideItem.style.transition = "none";
                    self.slideItem.style.transition = "height .5s ease .2s";
                    self.slideItem.style.height = "63px";
                    setTimeout(function () {
                        self.slideItem.style.height = "0";
                    }, 0);
                })


            };

            let isItem = function () {
                return event.target.className === "title";

            };



            self.$memo.addEventListener("touchstart", startHandler);
            self.$memo.addEventListener("touchmove", moveHandler);
            self.$memo.addEventListener("touchend", endHandler);
        }


    }

    document.addEventListener("DOMContentLoaded", function () {
        memo.init();
        memo.gesture();
    })

})();