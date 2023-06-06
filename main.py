@namespace
class SpriteKind:
    floor = SpriteKind.create()

# sprites
witch = sprites.create(assets.image("witch"), SpriteKind.player)
witch.y = 8
witch.set_stay_in_screen(True)

# variables
camera_offset = 52
new_spawn_y = 128
spawn_positions: List[Sprite] = []

def setup():
    for y in range(8, 121, 16):
        generate_row(y)
setup()

def generate_row(y):
    row: List[Sprite] = []
    for x in range(8, 153, 16):
        tile = sprites.create(assets.tile("path"), SpriteKind.floor)
        tile.set_position(x, y)
        tile.z = -10
        tile.set_flag(SpriteFlag.AUTO_DESTROY, True)
        row.append(tile)
    if randint(1, 2) == 1:
        spawn_positions.append(row.shift())
    else:
        spawn_positions.append(row.pop())
    for i in range(randint(0, 3)):
        spawn_enemy(spawn_positions[len(spawn_positions) - 1])

def new_row_spawn():
    global new_spawn_y
    if scene.camera_property(CameraProperty.BOTTOM) >= new_spawn_y:
        generate_row(new_spawn_y + 8)
        new_spawn_y += 16
        info.change_score_by(100)

def spawn_enemy(spawn_sprite: Sprite):
    if spawn_sprite.y == 8:
        return
    enemy = sprites.create(assets.image("mushroom"), SpriteKind.enemy)
    if spawn_sprite.x > 80:
        enemy.set_position(spawn_sprite.x + 10, spawn_sprite.y)
        animation.run_image_animation(enemy, assets.animation("mushroom left"), 100, True)
        enemy.vx = -20
    else:
        enemy.set_position(spawn_sprite.x - 10, spawn_sprite.y)
        animation.run_image_animation(enemy, assets.animation("mushroom right"), 100, True)
        enemy.vx = 20
    enemy.set_flag(SpriteFlag.AUTO_DESTROY, True)

def spawn_enemies():
    for spawn_point in spawn_positions:
        if randint(1, 250) == 1:
            spawn_enemy(spawn_point)

def delete_duplicates(enemy, other_enemy):
    enemy.destroy()
sprites.on_overlap(SpriteKind.enemy, SpriteKind.enemy, delete_duplicates)

def lose(player, enemy):
    game.over(False)
sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, lose)

def move(anim: List[image], x_change, y_change):
    animation.run_image_animation(witch, anim, 100, False)
    for i in range(8):
        witch.x += x_change
        witch.y += y_change
        pause(50)

def forward():
    move(assets.animation("forward"), 0, 2)
    spawn_positions.shift()

def left():
    move(assets.animation("left"), -2, 0)

def right():
    move(assets.animation("right"), 2, 0)

def throttle_move():
    if controller.down.is_pressed():
        timer.throttle("move", 50, forward)
    elif controller.left.is_pressed():
        timer.throttle("move", 50, left)
    elif controller.right.is_pressed():
        timer.throttle("move", 50, right)
controller.any_button.on_event(ControllerButtonEvent.PRESSED, throttle_move)

def tick():
    scene.center_camera_at(80, witch.y + camera_offset)
    new_row_spawn()
    spawn_enemies()
game.on_update(tick)


# coins
# water traps