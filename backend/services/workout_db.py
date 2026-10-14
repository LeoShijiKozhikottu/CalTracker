from typing import List, Optional
from models.schemas import ExerciseItem, ExerciseCategory

EXERCISES_DATABASE: List[ExerciseItem] = [
    # --- 1. OVERWEIGHT / JOINT-SAFE FAT LOSS EXERCISES ---
    ExerciseItem(
        id="ex-ow-1",
        name="Incline Treadmill Brisk Walk",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Glutes", "Hamstrings", "Calves", "Cardiovascular"],
        difficulty="Beginner",
        equipment="Treadmill",
        calories_per_20min=160.0,
        recommended_sets_reps="20-30 mins at 5-8% incline, 4.5 km/h",
        description="Walking on an incline significantly increases cardiovascular work and posterior chain calorie burn without the heavy knee and ankle impact of running.",
        safety_and_form_tip="Maintain upright posture; do not lean forward or grip handrails tightly. Keep stride natural.",
        icon_name="flame"
    ),
    ExerciseItem(
        id="ex-ow-2",
        name="Seated Cable Lat Pulldown",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Latissimus Dorsi", "Biceps", "Upper Back"],
        difficulty="Beginner",
        equipment="Cable Machine",
        calories_per_20min=120.0,
        recommended_sets_reps="3-4 sets of 12-15 reps",
        description="A spine-supported compound pull movement that builds foundational upper body pulling strength without loading compressed spinal discs.",
        safety_and_form_tip="Pull the bar down toward upper collarbone, driving elbows downwards. Keep chest proud and avoid excessive swinging.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-ow-3",
        name="Stationary Recumbent Bike",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Quadriceps", "Hamstrings", "Cardiovascular"],
        difficulty="Beginner",
        equipment="Recumbent Bike",
        calories_per_20min=150.0,
        recommended_sets_reps="25-35 mins moderate steady resistance",
        description="The reclined seating position takes total bodyweight load off the lumbar spine and patellar tendon while delivering steady fat burning aerobic conditioning.",
        safety_and_form_tip="Adjust seat distance so knees have a slight 5-10 degree bend at the bottom of each pedal stroke.",
        icon_name="activity"
    ),
    ExerciseItem(
        id="ex-ow-4",
        name="Bodyweight Bench / Box Squat",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Quadriceps", "Glutes", "Core"],
        difficulty="Beginner",
        equipment="Bench or Plyo Box",
        calories_per_20min=130.0,
        recommended_sets_reps="3 sets of 10-12 reps",
        description="Teaches hip hinge and squat mechanics safely. The box ensures controlled depth, preventing deep knee shear stress.",
        safety_and_form_tip="Push hips backward first as if sitting down into a chair. Lightly touch bench and drive back up through whole feet.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-ow-5",
        name="Seated Cable Row",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Rhomboids", "Middle Traps", "Lats", "Biceps"],
        difficulty="Beginner",
        equipment="Cable Machine",
        calories_per_20min=125.0,
        recommended_sets_reps="3-4 sets of 12-14 reps",
        description="Builds mid-back postural strength, pulling rounded shoulders back and opening the chest for better breathing capacity.",
        safety_and_form_tip="Sit tall, squeeze shoulder blades together at peak contraction, and control the return without rounding lower back.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-ow-6",
        name="Low-Impact Elliptical Glider",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Full Body", "Cardiovascular"],
        difficulty="Beginner",
        equipment="Elliptical Trainer",
        calories_per_20min=170.0,
        recommended_sets_reps="20-30 mins smooth cadence",
        description="Provides zero-impact continuous full-body aerobic conditioning. Feet remain flat on pedals, completely eliminating foot strike shock.",
        safety_and_form_tip="Actively push and pull the dual handlebars to distribute calorie burning work between arms and legs.",
        icon_name="activity"
    ),
    ExerciseItem(
        id="ex-ow-7",
        name="Floor Glute Bridge",
        category=ExerciseCategory.OVERWEIGHT,
        target_muscles=["Gluteus Maximus", "Hamstrings", "Core"],
        difficulty="Beginner",
        equipment="Exercise Mat",
        calories_per_20min=110.0,
        recommended_sets_reps="3 sets of 15 reps (2s hold at top)",
        description="Activates dormant glutes and stabilizes the pelvis without any vertical axial pressure on the knees or lower spine.",
        safety_and_form_tip="Drive through heels, squeeze glutes at the top without hyperextending your lower back.",
        icon_name="zap"
    ),

    # --- 2. WEIGHT LOSS / HIGH-CALORIE BURN FAT SHREDDING ---
    ExerciseItem(
        id="ex-wl-1",
        name="HIIT Treadmill Interval Sprints",
        category=ExerciseCategory.WEIGHT_LOSS,
        target_muscles=["Full Body", "Cardiovascular", "Legs"],
        difficulty="Intermediate",
        equipment="Treadmill",
        calories_per_20min=240.0,
        recommended_sets_reps="8-10 rounds: 30s sprint (12-14 km/h), 60s walk recovery",
        description="High-Intensity Interval Training elevates metabolism for hours post-workout via excess post-exercise oxygen consumption (EPOC).",
        safety_and_form_tip="Land mid-foot, stay relaxed through shoulders, and step onto side rails if fatigued before stopping.",
        icon_name="flame"
    ),
    ExerciseItem(
        id="ex-wl-2",
        name="Kettlebell Swings",
        category=ExerciseCategory.WEIGHT_LOSS,
        target_muscles=["Glutes", "Hamstrings", "Core", "Shoulders"],
        difficulty="Intermediate",
        equipment="Kettlebell (12-20 kg)",
        calories_per_20min=220.0,
        recommended_sets_reps="4 sets of 20 explosive swings",
        description="Explosive hip hinge movement that melts calories while simultaneously building posterior chain resilience and explosive power.",
        safety_and_form_tip="Hinge at the hips, not knees. Drive the bell up using explosive hip extension, not your arms.",
        icon_name="zap"
    ),
    ExerciseItem(
        id="ex-wl-3",
        name="Concept 2 Rowing Machine",
        category=ExerciseCategory.WEIGHT_LOSS,
        target_muscles=["Lats", "Legs", "Core", "Cardiovascular"],
        difficulty="Intermediate",
        equipment="Indoor Rower",
        calories_per_20min=210.0,
        recommended_sets_reps="500m intervals x 4 with 90s rest",
        description="Uses 86% of the body's muscle mass in every stroke. Delivers severe calorie burn with low articular impact.",
        safety_and_form_tip="Stroke sequence: Legs -> Body -> Arms on drive; Arms -> Body -> Legs on recovery.",
        icon_name="activity"
    ),
    ExerciseItem(
        id="ex-wl-4",
        name="Dumbbell Thrusters (Squat to Press)",
        category=ExerciseCategory.WEIGHT_LOSS,
        target_muscles=["Quads", "Deltoids", "Triceps", "Core"],
        difficulty="Advanced",
        equipment="Dumbbells",
        calories_per_20min=230.0,
        recommended_sets_reps="4 sets of 12 reps",
        description="Combines a deep front squat with an overhead press into one seamless fluid kinetic motion. Extreme heart rate booster.",
        safety_and_form_tip="Use the momentum from your leg drive to propel dumbbells overhead smoothly.",
        icon_name="flame"
    ),
    ExerciseItem(
        id="ex-wl-5",
        name="Battle Rope Slams & Alternating Waves",
        category=ExerciseCategory.WEIGHT_LOSS,
        target_muscles=["Shoulders", "Core", "Forearms", "Cardiovascular"],
        difficulty="Intermediate",
        equipment="Battle Ropes",
        calories_per_20min=200.0,
        recommended_sets_reps="5 sets: 30s all-out wave slam, 30s rest",
        description="Upper body anaerobic conditioning that incinerates stubborn visceral fat while sparing lower body joint fatigue.",
        safety_and_form_tip="Stay in an athletic quarter-squat base with core braced to absorb rope recoil.",
        icon_name="zap"
    ),

    # --- 3. BULKING & LEAN MUSCLE HYPERTROPHY ---
    ExerciseItem(
        id="ex-mg-1",
        name="Barbell Back Squat",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Quadriceps", "Glutes", "Adductors", "Spinal Erectors"],
        difficulty="Intermediate",
        equipment="Barbell & Squat Rack",
        calories_per_20min=170.0,
        recommended_sets_reps="4 sets of 6-8 reps (heavy progressive overload)",
        description="The foundation of lower-body mass and strength. Triggers massive systemic hormonal response for hypertrophy.",
        safety_and_form_tip="Brace core with Valsalva maneuver, keep chest up, descend until hip crease is parallel with knees.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-mg-2",
        name="Flat Barbell Bench Press",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Pectoralis Major", "Anterior Deltoids", "Triceps"],
        difficulty="Intermediate",
        equipment="Barbell & Bench",
        calories_per_20min=150.0,
        recommended_sets_reps="4 sets of 8-10 reps",
        description="Gold standard compound press for building dense chest thickness, front shoulder stability, and lockout pushing strength.",
        safety_and_form_tip="Retract scapulae against bench, plant feet firmly, touch mid-sternum, and press up slightly arched.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-mg-3",
        name="Romanian Deadlift (RDL)",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Hamstrings", "Gluteus Maximus", "Lower Back"],
        difficulty="Intermediate",
        equipment="Barbell or Heavy Dumbbells",
        calories_per_20min=160.0,
        recommended_sets_reps="3-4 sets of 8-12 reps",
        description="Loaded stretch on the hamstrings that stimulates hypertrophy and builds a bulletproof posterior chain.",
        safety_and_form_tip="Keep soft bend in knees, push hips straight back into wall behind you, keep bar skimming shins.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-mg-4",
        name="Overhead Dumbbell Incline Press",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Clavicular Head (Upper Chest)", "Front Deltoids", "Triceps"],
        difficulty="Intermediate",
        equipment="Incline Bench & Dumbbells",
        calories_per_20min=140.0,
        recommended_sets_reps="3-4 sets of 10-12 reps",
        description="Focuses tension directly onto the upper chest shelf for a full, aesthetic armor-plated physique.",
        safety_and_form_tip="Set bench angle to 30 degrees to minimize anterior shoulder strain and maximize upper pec activation.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-mg-5",
        name="Wide-Grip Bodyweight / Weighted Pull-Ups",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Latissimus Dorsi", "Biceps", "Teres Major"],
        difficulty="Advanced",
        equipment="Pull-Up Bar",
        calories_per_20min=155.0,
        recommended_sets_reps="4 sets of 6-10 reps",
        description="The ultimate V-taper builder. Widens the lats and develops supreme relative upper body pulling strength.",
        safety_and_form_tip="Start from a full dead hang, initiate pull by depressing shoulder blades, and pull chest towards bar.",
        icon_name="dumbbell"
    ),
    ExerciseItem(
        id="ex-mg-6",
        name="Standing Dumbbell Bicep Hammer Curls",
        category=ExerciseCategory.MUSCLE_GAIN,
        target_muscles=["Brachialis", "Brachioradialis", "Biceps Brachii"],
        difficulty="Beginner",
        equipment="Dumbbells",
        calories_per_20min=110.0,
        recommended_sets_reps="3 sets of 12-15 reps",
        description="Develops arm thickness and forearm grip strength by targeting the underlying brachialis muscle.",
        safety_and_form_tip="Keep elbows pinned to ribs, avoid swinging the torso, and control 2-second negative lowering.",
        icon_name="dumbbell"
    ),

    # --- 4. ATHLETIC & FUNCTIONAL CONDITIONING ---
    ExerciseItem(
        id="ex-at-1",
        name="Heavy Farmer's Walk",
        category=ExerciseCategory.ATHLETIC,
        target_muscles=["Forearms & Grip", "Traps", "Core Obliques", "Full Body"],
        difficulty="Intermediate",
        equipment="Heavy Dumbbells or Trap Bar",
        calories_per_20min=175.0,
        recommended_sets_reps="4 walks of 40 meters with heavy load",
        description="Functional strength at its purest. Builds unbreakable grip, massive upper traps, and rock-solid abdominal bracing.",
        safety_and_form_tip="Stand tall, pull shoulders down and back, take short controlled strides without swaying.",
        icon_name="shield"
    ),
    ExerciseItem(
        id="ex-at-2",
        name="Cable Face Pulls with Rope",
        category=ExerciseCategory.ATHLETIC,
        target_muscles=["Rear Deltoids", "Rotator Cuff", "Rhomboids"],
        difficulty="Beginner",
        equipment="Cable Machine with Tricep Rope",
        calories_per_20min=105.0,
        recommended_sets_reps="3 sets of 15-20 reps",
        description="The premier shoulder health and posture exercise. Balances out heavy pressing to prevent rotator cuff impingement.",
        safety_and_form_tip="Pull rope towards forehead while rotating hands back so thumbs point behind you. Squeeze rear delts.",
        icon_name="activity"
    ),
    ExerciseItem(
        id="ex-at-3",
        name="Hanging Knees-to-Chest / Leg Raises",
        category=ExerciseCategory.ATHLETIC,
        target_muscles=["Rectus Abdominis", "Hip Flexors", "Obliques"],
        difficulty="Intermediate",
        equipment="Pull-Up Bar",
        calories_per_20min=135.0,
        recommended_sets_reps="3 sets of 12-15 reps",
        description="Superior abdominal movement that engages lower abs through active posterior pelvic tilt without lumbar compression.",
        safety_and_form_tip="Curl your pelvis upward rather than just swinging legs. Minimize momentum.",
        icon_name="zap"
    )
]

def get_all_exercises(category: Optional[ExerciseCategory] = None) -> List[ExerciseItem]:
    if category:
        return [ex for ex in EXERCISES_DATABASE if ex.category == category]
    return EXERCISES_DATABASE

def get_exercise_by_id(exercise_id: str) -> Optional[ExerciseItem]:
    for ex in EXERCISES_DATABASE:
        if ex.id == exercise_id:
            return ex
    return None

