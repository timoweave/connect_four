# Connect Four

1. board on size nxm
1. win if user has continuous c in a row, col, or diagram

# Component Layout

1. use css `display: grid` for the game board,we then use `grid-area: f(x,y)` to layout cells and pieces, and finally use `grid-area: g(x,y)` to layout buttons. This approach makes all added component one-render only (no re-render needed for cells or pieces, avoiding `O(n x m)` rendering)
![plot](./doc/game-components.png)

# State and Functions
1. use context/hook to manage state between components
1. use pure functions to transform state from one  to another state
1. when a new piece is added, we then search for the adjacent consecutive piece of the same player. there are vertical (up and down) as shown in green arrows, horizontal (left, right) as shown in blue arrows, diagonal rise (down-left, up-right) as shown in purple arrows, diagonal fall (up-left, down-right) as shown in orange arrows,
![plot](./doc/game-find-winner.png)

# Screenshots
1. fresh game 
![plot](./doc/game-board.png)

1. an example of red and green player take turns
![layout](doc/game-ex1.png)

1. example of green use reach 4 count first
![layout](doc/game-green-won.png)
