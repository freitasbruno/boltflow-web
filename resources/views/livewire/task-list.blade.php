<div class="p-6 bg-white rounded-lg shadow-md border-t-4 border-gray-500">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Task List</h2>
        <x-button wire:click="$dispatch('create-task')">
            {{ __('Create Task') }}
        </x-button>
    </div>

    <div class="space-y-4">
        @forelse($tasks as $item)
            <div wire:key="task-item-{{ $item->id }}" class="p-4 border rounded-md">
                <div class="flex justify-between items-start">
                    <div class="flex items-start">
                        <input 
                            type="checkbox" 
                            class="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            @if($item->task->status === 'completed') checked @endif
                            wire:click="toggleCompleted({{ $item->task->id }})"
                        >
                        <div class="ml-4">
                            <h3 class="font-bold text-lg @if($item->task->status === 'completed') text-gray-500 line-through @endif">{{ $item->title }}</h3>
                            <p class="text-sm text-gray-600">{{ $item->description }}</p>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0 ml-4">
                        <div class="flex space-x-2">
                           {{-- This button now dispatches an event to the TaskForm component --}}
                           <button wire:click="$dispatch('edit-task', { itemId: {{ $item->id }} })" class="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                           <button wire:click="delete({{ $item->id }})" wire:confirm="Are you sure you want to delete this task?" class="text-sm text-red-600 hover:text-red-800">Delete</button>
                        </div>
                        <span class="block mt-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                            Prio: {{ $item->task->priority }}
                        </span>
                    </div>
                </div>
            </div>
        @empty
            <p>You have no tasks yet. Create one to get started!</p>
        @endforelse
    </div>

    <div class="mt-6">
        {{ $tasks->links() }}
    </div>
</div>