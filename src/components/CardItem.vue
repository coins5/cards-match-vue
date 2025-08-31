<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  flipped: boolean
  matched: boolean
  imageUrl: string
  label?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ (e:'click'):void }>()

const ariaLabel = computed(() => props.label ?? 'card')
</script>

<template>
  <button
    class="card"
    :class="{ flipped: props.flipped, matched: props.matched }"
    :aria-pressed="props.flipped"
    :disabled="props.disabled || props.matched"
    @click="emit('click')"
  >
    <span class="sr-only">{{ ariaLabel }}</span>
    <div class="inner">
      <div class="face front">
        <img :src="props.imageUrl" alt="" />
      </div>
      <div class="face back" aria-hidden="true">?</div>
    </div>
  </button>
  
</template>

<style scoped>
.card{
  position:relative;
  width:100%;
  aspect-ratio: 3/4;
  border:0;
  background:transparent;
  padding:0;
  perspective: 700px;
  cursor:pointer;
}
.card:disabled{ opacity:.8; cursor:default; }
.inner{
  position:absolute; inset:0;
  border-radius:12px;
  border:1px solid #2a2f3d;
  background: #16181d;
  transform-style: preserve-3d;
  transition: transform .5s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,.25), inset 0 -20px 40px rgba(0,0,0,.2);
}
.card.flipped .inner, .card.matched .inner{ transform: rotateY(180deg); }

.face{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center; border-radius:12px; backface-visibility:hidden;
}
.front{ transform: rotateY(180deg); overflow:hidden;}
.front img{ width:100%; height:100%; object-fit:cover; display:block; }
.back{ background: linear-gradient(180deg, #1b1f29 0%, #12151c 100%); font-size: calc(24px + 1.2vmin); color:#6d7484; font-weight:800; letter-spacing:1px; }

.card.matched .inner{ outline: 2px solid #2a5a44; box-shadow: 0 0 0 2px rgba(110,231,183,.15) inset, 0 8px 20px rgba(0,0,0,.35); }

</style>

