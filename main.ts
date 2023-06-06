namespace SpriteKind {
    export const floor = SpriteKind.create()
}

//  sprites
let witch = sprites.create(assets.image`witch`, SpriteKind.Player)
witch.y = 8
witch.setStayInScreen(true)
//  variables
let camera_offset = 52
let new_spawn_y = 128
let spawn_positions : Sprite[] = []
function setup() {
    for (let y = 8; y < 121; y += 16) {
        generate_row(y)
    }
}

setup()
function generate_row(y: number) {
    let tile: Sprite;
    let row : Sprite[] = []
    for (let x = 8; x < 153; x += 16) {
        tile = sprites.create(assets.tile`path`, SpriteKind.floor)
        tile.setPosition(x, y)
        tile.z = -10
        tile.setFlag(SpriteFlag.AutoDestroy, true)
        row.push(tile)
    }
    if (randint(1, 2) == 1) {
        spawn_positions.push(row.shift())
    } else {
        spawn_positions.push(row.pop())
    }
    
    for (let i = 0; i < randint(0, 3); i++) {
        spawn_enemy(spawn_positions[spawn_positions.length - 1])
    }
}

function new_row_spawn() {
    
    if (scene.cameraProperty(CameraProperty.Bottom) >= new_spawn_y) {
        generate_row(new_spawn_y + 8)
        new_spawn_y += 16
        info.changeScoreBy(100)
    }
    
}

function spawn_enemy(spawn_sprite: Sprite) {
    if (spawn_sprite.y == 8) {
        return
    }
    
    let enemy = sprites.create(assets.image`mushroom`, SpriteKind.Enemy)
    if (spawn_sprite.x > 80) {
        enemy.setPosition(spawn_sprite.x + 10, spawn_sprite.y)
        animation.runImageAnimation(enemy, assets.animation`mushroom left`, 100, true)
        enemy.vx = -20
    } else {
        enemy.setPosition(spawn_sprite.x - 10, spawn_sprite.y)
        animation.runImageAnimation(enemy, assets.animation`mushroom right`, 100, true)
        enemy.vx = 20
    }
    
    enemy.setFlag(SpriteFlag.AutoDestroy, true)
}

function spawn_enemies() {
    for (let spawn_point of spawn_positions) {
        if (randint(1, 250) == 1) {
            spawn_enemy(spawn_point)
        }
        
    }
}

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Enemy, function delete_duplicates(enemy: Sprite, other_enemy: Sprite) {
    enemy.destroy()
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function lose(player: Sprite, enemy: Sprite) {
    game.over(false)
})
function move(anim: any[], x_change: number, y_change: number) {
    animation.runImageAnimation(witch, anim, 100, false)
    for (let i = 0; i < 8; i++) {
        witch.x += x_change
        witch.y += y_change
        pause(50)
    }
}

controller.anyButton.onEvent(ControllerButtonEvent.Pressed, function throttle_move() {
    if (controller.down.isPressed()) {
        timer.throttle("move", 50, function forward() {
            move(assets.animation`forward`, 0, 2)
            spawn_positions.shift()
        })
    } else if (controller.left.isPressed()) {
        timer.throttle("move", 50, function left() {
            move(assets.animation`left`, -2, 0)
        })
    } else if (controller.right.isPressed()) {
        timer.throttle("move", 50, function right() {
            move(assets.animation`right`, 2, 0)
        })
    }
    
})
game.onUpdate(function tick() {
    scene.centerCameraAt(80, witch.y + camera_offset)
    new_row_spawn()
    spawn_enemies()
})
