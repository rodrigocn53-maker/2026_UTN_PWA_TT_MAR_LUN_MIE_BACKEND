
class ChannelDTO {
    constructor (channel){

        this.channel_id = channel._id
        this.channel_name = channel.name
        this.channel_description = channel.description
        this.channel_workspace_id = channel.fk_id_workspace
        this.channel_is_active = channel.is_active
    }
}

export default ChannelDTO