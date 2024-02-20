<template>
	<div v-if="hasCrewMembers">
		<template v-for="(chunk, index) in chunkedCrewMembers" :key="index">
			<div :class="loadMoreClass(selectedLimit)">
				<div class="crew-container" v-for="member in chunk" :key="member.id">
					<img :src="member.image" :alt="member.name"/>
					<div class="crew-overlay">
						<div class="crew-text">
							<p class="crew-name">{{ member.name }}</p>
							<p class="crew-duties">{{ member.duties }}</p>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>

	<div class="load-more__center" v-else-if="isLoading">
		<p>Loading...</p>
	</div>

	<div class="load-more__center" v-else>
		<p>No crew members found.</p>
	</div>

	<div class="load-more__end" v-if="selectedLimit !== 2">
		<a href="#" class="button" :class="{'button--style--link-white': selectedLimit !== 4, 'button--style--link': selectedLimit === 4}" @click="updateSelectedLimit($event, 4)">4</a>

		<a href="#" class="button" :class="{'button--style--link-white': selectedLimit !== 5, 'button--style--link': selectedLimit === 5}" @click="updateSelectedLimit($event, 5)">5</a>

		<a href="#" class="button" :class="{'button--style--link-white': selectedLimit !== 6, 'button--style--link': selectedLimit === 6}" @click="updateSelectedLimit($event, 6)">6</a>
	</div>

	<div class="load-more__center" v-if="hasCrewMembers && selectedPage < totalPages">
		<button type="button" class="load-more__button" @click="nextPage($event)">Load More</button>
	</div>
</template>

<script>
import axios from 'axios';

export default {
	data() {
		return {
			selectedDuty: '',
			selectedPage: 1,
			selectedLimit: 5,
			crewMembers: [],
			isLoading: false,
			totalPages: 1,
		};
	},
	computed: {
		hasCrewMembers() {
			return this.crewMembers.length > 0;
		},
		chunkedCrewMembers() {
			const chunkSize = this.selectedLimit;
			const arrayCopy = [...this.crewMembers];
			const chunks = [];
			while (arrayCopy.length) {
				chunks.push(arrayCopy.splice(0, chunkSize));
			}
			return chunks;
		}
	},
	methods: {
		async fetchCrewMembers() {
			this.isLoading = true;
			try {
				const params = {
					page: this.selectedPage,
					limit: this.selectedLimit,
				};

				if (this.selectedDuty !== '')
					params.duty = this.selectedDuty;

				const response = await axios.get('https://challenge-api.view.agentur-loop.com/api/', {
					params: params,
					headers: {
						Authorization: 'Bearer 0123456789'
					}
				});

				const responseData = response.data.data.data;
				const pagination = response.data.data.meta.pagination;

				this.totalPages = pagination.total_pages;

				//console.log(pagination);

				if (responseData && responseData.length > 0) {
					this.crewMembers.push(...responseData);
				} else {
					this.crewMembers = [];
				}

			} catch (error) {
				console.error('Error fetching crew members:', error);
			} finally {
				this.isLoading = false;
			}
		},
		handleBtnFilterClick(event) {
			event.preventDefault();

			const btnFilters = document.querySelectorAll('.btn-filter');

			btnFilters.forEach(btn => {
				btn.classList.remove('button--style--link');
			});

			btnFilters.forEach(btn => {
				if (btn !== event.currentTarget) {
					btn.classList.add('button--style--link-white');
				}
			});

			event.currentTarget.classList.remove('button--style--link-white');

			event.currentTarget.classList.add('button--style--link');

			let caption = event.target.textContent.trim().toLowerCase();

			if (caption === 'show all') {
				caption = '';
			}

			this.selectedDuty = caption;

			const limit = parseInt(caption);
			if (!isNaN(limit)) {
				this.selectedLimit = limit;
			}

			this.selectedPage = 1;
			this.crewMembers = [];

			this.fetchCrewMembers();
		},
		updateSelectedLimit(event, limit) {
			event.preventDefault();

			this.selectedLimit = limit;
			this.selectedPage = 1;
			this.crewMembers = [];

			this.fetchCrewMembers();
		},
		nextPage(event) {
			event.preventDefault();

			if (this.selectedPage < this.totalPages) {
				this.selectedPage++;
				this.fetchCrewMembers();
			}
		},
		loadMoreClass(selectedLimit) {
			return ['load-more', `load-more__${selectedLimit}`];
		}
	},
	mounted: function() {
		const btnFilters = document.querySelectorAll('.btn-filter');
		btnFilters.forEach(btn => {
			btn.addEventListener('click', this.handleBtnFilterClick);
		});

		const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (screenWidth < 768)
			this.selectedLimit = 2;

		this.fetchCrewMembers();
	},
	beforeDestroy: function() {
		const btnFilters = document.querySelectorAll('.btn-filter');
		btnFilters.forEach(btn => {
			btn.removeEventListener('click', this.handleBtnFilterClick);
		});
	},
};
</script>