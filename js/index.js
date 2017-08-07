(function () {
    let memo = {
        LOCAL_STORAGE_KEY: "iaei-memos",


        init() {
            this.items = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY)) || [];
            this.index = null;
            this.$memo = document.querySelector("#memo");
            this.$memo.addEventListener("click", this);
            // this.$memo.addEventListener("click", function(){
            //     console.log(event.target.parentElement);
            // });



            this.$item = document.querySelectorAll(".item");
            this.$items = document.querySelector(".items");
            this.$newItem = document.querySelector("#newItem");
            this.$title = document.querySelectorAll(".title")
            this.$detail = document.querySelectorAll(".detail");
            this.$undo = document.querySelector("#undo");

            this.$editor = document.querySelector("#editor");
            this.$edTitle = document.querySelector("#edTitle");
            this.$edDetail = document.querySelector("#edDetail");
            this.$undoButtton = document.querySelector("#undoButton");

            this.render();
        },

        handleEvent(event) {
            let target = event.target;
            switch (true) {
                case target.matches("#newItem"):
                    this.clear();
                    this.editor();
                    break;
                case target.matches(".save"):
                    this.save();
                    break;
                case target.matches(".close"):
                    this.home();
                    break;
                case target.matches(".title"):
                    this.view();
                    break;
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
            this.$editor.style.transform = 'scaleY(0)';
            this.$memo.style['overflow-y'] = 'visible';

        },

        clear() {
            this.index = null;
            this.$edTitle.value = null;
            this.$edDetail.value = null;
        },



        editor() {
            this.$editor.style.transform = 'scaleY(1)';
            this.$memo.style.height = "100vh";
            this.$memo.style['overflow-y'] = 'hidden';
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
            this.index = event.target.parentElement.getAttribute('data-index');
            this.$edTitle.value = this.items[this.index].title;
            this.$edDetail.value = this.items[this.index].detail;
            this.editor();
        },

        //主屏幕手势操作
        gesture() {
            let self = this;
            let startHandler = function (event) {
                self.countNum = 0;
                if (isItem()) {
                    self.target = event.target;
                    self.slideItem = event.target.parentElement;//被滑动的元素
                    self.ind = self.slideItem.dataset.index;
                    self.slideItem.style.transition = "";
                }

                self.startX = event.touches[0].pageX;
                self.startY = event.touches[0].pageY;
                self.offsetX = 0;
                self.startTime = +new Date();

            };

            let moveHandler = function (event) {
                //用于找到第一次touchmove事件
                event.count = function () {
                    return self.countNum++;
                }();

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
                if (self.offsetX !== 0 && isItem() && self.moveDirection === "td") {
                    if (self.offsetX >= boundary) {
                        go("1");
                    } else if (self.offsetX < -boundary) {
                        go("-1");
                    } else {
                        go("0");
                    }
                }
            };

            let moveDirection = function () {
                if (self.countNum === 1) {
                    if (self.angle > -45 && self.angle < 45 || self.angle < -135 || self.angle > 135) {
                        self.moveDirection = "td";
                        return;//用户横向滑动 transverse direction
                    } else {
                        self.moveDirection = "md";
                        return;//用户纵向滑动 machine direction
                    }
                }
            };

            let go = function (dir) {
                self.slideItem.style.transition = "all .5s";
                switch (dir) {
                    case "1":
                        self.slideItem.style.transform = `translate3d(${window.innerWidth}px,0,0)`;
                        del.showUndo();
                        self.slideItem.classList.add("waitBeDel");
                        del.heightSmaller();
                        break;
                    case "-1":
                        self.slideItem.style.transform = `translate3d(-${window.innerWidth}px,0,0)`;
                        del.showUndo();
                        self.slideItem.classList.add("waitBeDel");
                        del.heightSmaller();
                        break;
                    case "0":
                        self.slideItem.style.transform = `translate3d(0,0,0)`;
                        break;
                }
            };

            let del = {

                showUndo: function () {

                    let t = 0;
                    self.$undo.style.display = "block";


                    clearInterval(self.t);
                    self.t = setInterval(function () {
                        t++;
                        //undo5秒后消失
                        if (t >= 5) {
                            this.delElement();
                            self.$undo.style.display = "none";
                            clearInterval(self.t);
                        }
                    }.bind(this), 1000);
                },

                heightSmaller: function () {
                    let smallerHeight = function () {
                        this.style.height = "0";
                        self.slideItem.removeEventListener("transitionend", smallerHeight);
                    };
                    self.slideItem.addEventListener("transitionend", smallerHeight);

                },

                delElement: function () {
                    self.$waitBeDel = document.querySelectorAll(".waitBeDel");
                    console.log(self.$waitBeDel);
                    self.$waitBeDel.forEach(function (element) {
                        let i = element.dataset.index;
                        self.items[i].waitBeDel = true;
                    }, this);
                    self.items=self.items.filter(function(element){
                        return element.waitBeDel===undefined;         
                    })
                    self.storage();
                    self.render();

                },

            };

            let isItem = function () {
                return event.target.className === "title";

            };



            self.$memo.addEventListener("touchstart", startHandler);
            self.$memo.addEventListener("touchmove", moveHandler);
            self.$memo.addEventListener("touchend", endHandler);
            self.$undoButtton.addEventListener("click", function () {
                self.slideItem.classList.remove("waitBeDel");
                self.slideItem.style.transition = "all .5s";
                self.slideItem.style.height = '63px';
                self.slideItem.style.transform = `translate3d(0,0,0)`;
            });
        }


    }

    document.addEventListener("DOMContentLoaded", function () {
        memo.init();
        memo.gesture();
    })

})();