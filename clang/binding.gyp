{
  	"targets": [
    	{ 
      		"target_name": "main",
      		"sources": [
                "main.cpp",
                "test.cpp",

                "./timer/timer.cpp",
                "./tcp/tcpclient.cpp",
                "./tcp/testtcp.cpp",

                "./src/base.cpp",
                "./src/globals.cpp",
                "./src/card/card.cpp",
                "./src/player/player.cpp",
                "./src/room/seat.cpp",
                "./src/room/room.cpp",
                "./src/status/status.cpp",
                "./src/status/status_mgr.cpp",
                "./src/card_mgr/card_mgr.cpp",
                "./src/room_mgr/room_mgr.cpp",

                "./src/status/room_status/wait_status.cpp",
                "./src/status/room_status/start_status.cpp",
                "./src/status/room_status/hole_status.cpp",
                "./src/status/room_status/flop_status.cpp",
                "./src/status/room_status/turn_status.cpp",
                "./src/status/room_status/river_status.cpp",
                "./src/status/room_status/stop_status.cpp",

                "./src/status/player_status/allin_status.cpp",
                "./src/status/player_status/bet_status.cpp",
                "./src/status/player_status/call_status.cpp",
                "./src/status/player_status/check_status.cpp",
                "./src/status/player_status/fold_status.cpp",
                "./src/status/player_status/raise_status.cpp",
                "./src/status/player_status/waits_status.cpp"
      		]
    	}
  	]
}