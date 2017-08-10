(function () {
    let memo = {
        LOCAL_STORAGE_KEY: "iaei-memos",


        init() {
            this.items = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY)) || [];
            this.index = null;
            this.$memo = document.querySelector("#memo");



            this.$toolBar = document.querySelector("#toolBar");
            this.$item = document.querySelectorAll(".item");
            this.$items = document.querySelector(".items");
            this.$title = document.querySelectorAll(".title")
            this.$undo = document.querySelector("#undo");
            this.$homeMain = document.querySelector("#homeMain");

            this.$editor = document.querySelector("#editor");
            this.$edTitle = document.querySelector("#edTitle");
            this.$edDetail = document.querySelector("#edDetail");
            this.$undoButtton = document.querySelector("#undoButton");
            this.$hold = document.querySelector(".hold");
            this.$appName = document.querySelector("#appName");
            this.$quitHold = document.querySelector(".quitHold");
            this.$bin = document.querySelector(".bin");
            this.$send = document.querySelector("#send");
            this.$inputArea = document.querySelector("#inputArea");
            this.$confirmDelWrap = document.querySelector(".confirmDelWrap");
            this.$confirmDel = document.querySelector("#true");
            this.$giveUpDel = document.querySelector("#false");
            this.$blank = document.querySelector(".blank");

            this.$memo.addEventListener("click", this);



            this.render();
        },

        handleEvent(event) {
            let target = event.target;
            switch (true) {
                case target.matches(".save"):
                    this.save();
                    break;
                case target.matches(".close"):
                    this.home();
                    break;
                case target.matches("#send"):
                    this.new();
                    break;
            }
        },

        render() {
            //console.log(this.items.length === 0);
            if (this.items.length === 0) {
               this.$blank.style.display="flex";
            } else {
                this.$blank.style.display="none";
            }
            this.$items.innerHTML = this.items.map(function (item, index) {
                return `<div class = "itemWrap" data-index="${index}">
                            <div class= "item" data-index="${index}" check="-1">
                                <div class="circle"></div>
                                <div class = "title" ">
                                    <p>${item.title}</p>
                                    <div class="deadLine"></div>
                                </div>
                            </div>
                        </div>
                        `
            }).join('');
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

        new() {
            if (this.$inputArea.value.length > 0) {
                this.items.unshift({ title: this.$inputArea.value, detail: "" });
                this.storage();
                this.render();
                this.$inputArea.value = "";
            }

        },

        save() {
            this.items[this.index].title = this.$edTitle.value;
            this.items[this.index].detail = this.$edDetail.value;

            this.storage();
            this.render();
            this.home();
        },

        storage() {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.items));
        },

        view() {
            event.target.style.cursor = "pointer";
            memo.index = event.target.parentElement.getAttribute('data-index');
            memo.$edTitle.value = memo.items[memo.index].title;
            memo.$edDetail.value = memo.items[memo.index].detail;
            memo.editor();
        },

        //主屏幕手势操作
        gesture() {
            let self = this;

            let init = function () {
                self.target = event.target;
                self.slideItem = event.target.parentElement;//被滑动的元素
                self.ind = self.slideItem.dataset.index;
            };

            let startHandler = function (event) {
                self.countNum = 0;
                if (isItem()) {
                    init();
                    self.slideItem.style.transition = "";
                    self.ishold = true;
                }

                self.startX = event.touches[0].pageX;
                self.startY = event.touches[0].pageY;
                self.offsetX = 0;
                self.startTime = +new Date();

                self.islongtouch = setTimeout(function () {
                    if (self.ishold) {
                        self.slideItem.firstElementChild.style.backgroundColor="#46e8b6";//笔记被选中时做
                        self.slideItem.setAttribute("check","1");
                        self.slideItem.classList.add("waitBeDel");
                        multiSelectMode();
                    }
                }, 500);

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
                // console.log(self.moveDirection);
                if (isItem() && self.moveDirection === "td") {
                    event.preventDefault();
                    self.slideItem.style.transform = `translate3d(${self.offsetX}px,0,0)`;
                }
            };

            let endHandler = function (event) {
                self.ishold = false;
                clearTimeout(self.islongtouch);
                self.endTime = +new Date();
                self.touchTime = self.endTime - self.startTime;
                let boundary = window.innerWidth / 3;//滑动屏幕1/3的距离则表示删除
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
                self.ishold = false;
                //从用户滑动的一开始就确定滑动方向
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
                        //undo3秒后消失
                        if (t >= 3&&self.slideItem.getAttribute("check") === "-1") {
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
                    // console.log(self.$waitBeDel);
                    self.$waitBeDel.forEach(function (element) {
                        let i = element.dataset.index;
                        self.items[i].waitBeDel = true;
                    }, this);
                    self.items = self.items.filter(function (element) {
                        return element.waitBeDel === undefined;
                    })
                    self.storage();
                    self.render();
                },
            };

            let isItem = function () {
                return event.target.className === "title";
            };

            let undo = function () {
                self.slideItem.classList.remove("waitBeDel");
                self.slideItem.style.transition = "all .5s";
                self.slideItem.style.height = '63px';
                self.slideItem.style.transform = `translate3d(0,0,0)`;
                self.$undo.style.display = "none";
            };

            let multiSelectMode = function () {
                self.$toolBar.style.background = "#fff";
                self.$hold.style.display = "flex";
                self.$appName.style.display = "none";
                self.$memo.removeEventListener("touchstart", startHandler);
                self.$memo.removeEventListener("touchmove", moveHandler);
                self.$memo.removeEventListener("touchend", endHandler);
                self.$items.removeEventListener("click", self.view);
                self.$items.addEventListener("click", multiSelect);


                self.$quitHold.addEventListener("click", normalMode);
                self.$bin.addEventListener("click", function () {
                    self.$confirmDelWrap.style.display = "flex";
                });

                self.$confirmDelWrap.addEventListener("click", bin);
            };

            let bin = function () {
                if (event.target.dataset.confirm === "true") {
                    del.delElement();
                    self.$confirmDelWrap.style.display = "none";
                    normalMode();
                } else if (event.target.dataset.confirm === "false") {
                    self.$confirmDelWrap.style.display = "none";
                } else if (event.target.matches(".confirmDelWrap")) {
                    self.$confirmDelWrap.style.display = "none";
                }
            };


            let multiSelect = function () {
                if (isItem()) {
                    init();
                    //单击选中，再单击取消选中
                    event.check = function () {
                        // console.log(self.slideItem);
                        var ischeck = +self.slideItem.getAttribute("check") * -1;
                        self.slideItem.setAttribute("check", `${ischeck}`);
                    }();
                    if (self.slideItem.getAttribute("check") === "1") {
                        //笔记被选中时做
                        self.slideItem.firstElementChild.style.backgroundColor="#46e8b6";
                        
                        self.slideItem.classList.add("waitBeDel");
                    } else if (self.slideItem.getAttribute("check") === "-1") {
                        //笔记未选中时做
                        self.slideItem.firstElementChild.style.backgroundColor="rgb(19, 120, 240)";
                        self.slideItem.classList.remove("waitBeDel");
                    }
                }
            };

            let normalMode = function () {
                self.$toolBar.style.background = "#1378f0";
                self.$hold.style.display = "none";
                self.$appName.style.display = "block";
                self.$items.removeEventListener("click", multiSelect);
                self.render();
                self.$memo.addEventListener("touchstart", startHandler);
                self.$memo.addEventListener("touchmove", moveHandler);
                self.$memo.addEventListener("touchend", endHandler);
                self.$items.addEventListener("click", self.view);
            };

            normalMode();
            self.$undoButtton.addEventListener("click", undo);
        }

    }

    document.addEventListener("DOMContentLoaded", function () {
        memo.init();
        memo.gesture();
    })

})();