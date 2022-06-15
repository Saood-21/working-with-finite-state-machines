import { assign, createMachine, interpret } from "xstate";

const dogWalkMachine = createMachine({
    initial : 'waiting',
    states : {
      waiting :{
        on : {
            LEAVE_HOME : {
                target : 'on_walk'
            }
        },

      },

        on_walk : {
            initial : 'walking',
            states : {
                walking : {
                on : {

                    SPEED_UP : {
                        target : 'running'
                    },
                    STOP : {
                        target : 'stopping_to_sniff_good_smell'
                    }
                }
                },

                running : {
                on : {
                    SUDDEN_STOP : {
                        target : 'stopping_to_sniff_good_smell'
                    },
                    SLOW_DOWN : {
                        target : 'walking'
                    }

                }
                },
                stopping_to_sniff_good_smell : {
                on : {
                    SPEED_UP : {
                        target : 'walking'
                    },
                    SUDDEN_SPEED_UP : {
                        target : 'running'
                    }

                }
                }

            }
            ,on : {
            ARRIVE_HOME : {
                target : 'walk_complete'
            }
    
            }
        }
    }
})

const dogLife = interpret(dogWalkMachine).onTransition((state) => {console.log(state.value)}).start()

dogLife.send('LEAVE_HOME')