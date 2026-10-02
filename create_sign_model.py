#!/usr/bin/env python3
# Creates a 1:1 Blender model of the supplied review stand:
# upright panel 120 x 140 mm, base 120 x 50 mm, 2 mm material thickness.
# The reference dimension image is used only for geometry.
import bpy
import math
from mathutils import Vector

# Units: millimetres, with a scene scale declaration for accurate metadata.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.unit_settings.scale_length = 0.001
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = True
scene.world.color = (0.035, 0.043, 0.075)

# Physical dimensions from reference (mm)
WIDTH = 120
PANEL_HEIGHT = 140
BASE_DEPTH = 50
THICKNESS = 2
LEAN_DEGREES = 10  # top leans backward toward the rear of the horizontal base

white = bpy.data.materials.new('Warm white acrylic')
white.diffuse_color = (0.93, 0.95, 1.0, 1.0)
white.metallic = 0.0
white.roughness = 0.27
edge = bpy.data.materials.new('Acrylic edge')
edge.diffuse_color = (0.55, 0.59, 0.69, 1.0)
edge.metallic = 0.12
edge.roughness = 0.33
navy = bpy.data.materials.new('Ink')
navy.diffuse_color = (0.025, 0.042, 0.09, 1.0)
navy.roughness = 0.42
blue = bpy.data.materials.new('Google blue'); blue.diffuse_color = (0.12, 0.37, 0.80, 1)
red = bpy.data.materials.new('Google red'); red.diffuse_color = (0.91, 0.16, 0.17, 1)
yellow = bpy.data.materials.new('Google yellow'); yellow.diffuse_color = (0.96, 0.64, 0.07, 1)
green = bpy.data.materials.new('Google green'); green.diffuse_color = (0.10, 0.52, 0.28, 1)
orange = bpy.data.materials.new('Stars'); orange.diffuse_color = (0.98, 0.59, 0.05, 1)

# Helpers
def cube(name, loc, dims, material, bevel=0.8):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    if bevel > 0:
        bevel_mod = obj.modifiers.new('Soft acrylic edges', 'BEVEL')
        bevel_mod.width = bevel
        bevel_mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=bevel_mod.name)
    return obj

def text_obj(body, name, size, loc, material, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(90), 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = body
    obj.data.align_x = align
    obj.data.align_y = 'CENTER'
    obj.data.size = size
    obj.data.extrude = 0.12
    obj.data.bevel_depth = 0.03
    obj.data.materials.append(material)
    return obj

def ring_segment(start_deg, end_deg, mat):
    # curve with bevel gives smooth printed colored ring parts on panel
    curve = bpy.data.curves.new('Printed color ring', type='CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = 1.4
    curve.bevel_resolution = 4
    spline = curve.splines.new('POLY')
    count = 25
    spline.points.add(count - 1)
    for i in range(count):
        a = math.radians(start_deg + (end_deg-start_deg)*i/(count-1))
        x = 35 * math.cos(a)
        z = 75 + 35 * math.sin(a)
        # y is slightly forward of the panel, z is world up
        spline.points[i].co = (x, -1.26, z, 1)
    obj = bpy.data.objects.new('Color ring', curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

def five_point_star(cx, cz, outer, inner, material):
    verts=[]
    for i in range(10):
        a=math.radians(90 + i*36)
        r=outer if i%2==0 else inner
        verts.append((cx + math.cos(a)*r, -1.45, cz + math.sin(a)*r))
    mesh=bpy.data.meshes.new('Star')
    mesh.from_pydata(verts, [], [list(range(10))])
    mesh.materials.append(material)
    obj=bpy.data.objects.new('Five star review', mesh)
    bpy.context.collection.objects.link(obj)
    solid=obj.modifiers.new('Printed relief', 'SOLIDIFY'); solid.thickness=.2
    return obj

angle = math.radians(-LEAN_DEGREES)
# The horizontal plate and the upright use the same acrylic thickness. The
# calculated contact point makes their outer edges tangent, without overlap.
pivot = Vector((
    0,
    BASE_DEPTH / 2 - THICKNESS / 2,
    THICKNESS - math.sin(angle) * THICKNESS / 2,
))
base_center_y = pivot.y + math.cos(angle) * THICKNESS / 2 + BASE_DEPTH / 2
base = cube(
    'Base — tangent joint, 116 × 50 mm',
    (0, base_center_y, THICKNESS / 2),
    (116, BASE_DEPTH, THICKNESS),
    white,
    1.0,
)
# The panel rises from the tangency edge. Its top leans backward toward +Y.
local = Vector((0, 0, PANEL_HEIGHT / 2))
rot = Vector((local.x, local.y * math.cos(angle) - local.z * math.sin(angle), local.y * math.sin(angle) + local.z * math.cos(angle)))
plate = cube('Upright panel — printed front / plain white rear', pivot + rot, (WIDTH, THICKNESS, PANEL_HEIGHT), white, 2.2)
plate.rotation_euler[0] = angle

# All graphics are attached only to the intended printed front (-Y) of the panel.
# The opposite panel face is intentionally blank white.
art = bpy.data.objects.new('Printed front only', None)
bpy.context.collection.objects.link(art)
art.location = pivot
art.rotation_euler[0] = angle

def parent_to_art(obj):
    # Object coordinates are intentionally local to the printed panel face.
    obj.parent = art

# Work with design mapped to panel vertical plane (y near front). Art group local origin panel bottom.
# Although geometric labels form a standout model, final browser uses equivalent SVG on CSS geometry.
for s,e,m in [(135,225,blue),(45,135,red),(-45,45,yellow),(-135,-45,green)]:
    o=ring_segment(s,e,m); parent_to_art(o)

for x, char, mat in [(-25,'G',blue),(-12,'o',red),(-2,'o',yellow),(8,'g',blue),(18,'l',green),(26,'e',red)]:
    o=text_obj(char, 'Google letter '+char, 18, (x,-1.38,50), mat); parent_to_art(o)
for x in [-32,-16,0,16,32]:
    o=five_point_star(x, 19, 5.4, 2.35, orange); parent_to_art(o)
for body,size,z in [('Review Us On', 10.5, 125), ('NFC', 5.0, 94), ('TAP HERE', 5.2, 68)]:
    o=text_obj(body, body, size, (0,-1.4,z), navy); parent_to_art(o)
# Simple NFC arcs represented by torus sections with curves.
for r in [6,9,12]:
    c=bpy.data.curves.new('NFC wave','CURVE'); c.dimensions='3D'; c.bevel_depth=.55
    s=c.splines.new('POLY'); count=10; s.points.add(count-1)
    for i in range(count):
        a=math.radians(25+130*i/(count-1))
        s.points[i].co=(r*math.cos(a),-1.38,84+r*math.sin(a),1)
    ob=bpy.data.objects.new('NFC wave',c); bpy.context.collection.objects.link(ob); ob.data.materials.append(navy); parent_to_art(ob)
# printed line under stars: four Google-colored strips.
for x,w,mat in [(-37,18,red),(-16,18,green),(5,18,blue),(26,18,yellow)]:
    o=cube('Printed bottom stripe', (x,-1.35,7), (w,.25,2.3), mat,.15); parent_to_art(o)

# floor
floor = cube('Presentation floor', (0, 0, -1), (500, 500, 2), bpy.data.materials.new('Floor'), 0)
floor.data.materials[0].diffuse_color=(0.025,0.035,0.065,1)
floor.data.materials[0].roughness=.3

# Camera and lights
bpy.ops.object.light_add(type='AREA', location=(120,-120,180))
key=bpy.context.object; key.name='Softbox key'; key.data.energy=750; key.data.shape='DISK'; key.data.size=120
key.rotation_euler=(math.radians(25),0,math.radians(40))
bpy.ops.object.light_add(type='AREA', location=(-130,-80,90))
fill=bpy.context.object; fill.name='Blue fill'; fill.data.energy=450; fill.data.color=(0.2,0.4,1); fill.data.size=100
bpy.ops.object.light_add(type='AREA', location=(0,100,120))
rim=bpy.context.object; rim.name='Rim light'; rim.data.energy=800; rim.data.color=(1,.33,.16); rim.data.size=70
bpy.ops.object.camera_add(location=(215,-270,155))
cam=bpy.context.object; cam.name='Product camera'; scene.camera=cam

def look_at(obj, target):
    direction=Vector(target)-obj.location
    obj.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
look_at(cam,(0,4,66))
cam.data.lens=58
import os
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
scene.render.filepath = os.path.join(PROJECT_DIR, 'assets', 'sign-render.png')
# Export a portable geometry asset as well as the .blend source.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(PROJECT_DIR, 'google-review-nfc-stand.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(PROJECT_DIR, 'assets', 'google-review-nfc-stand.glb'), export_format='GLB', export_materials='EXPORT')
bpy.ops.render.render(write_still=True)
