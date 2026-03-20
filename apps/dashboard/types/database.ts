export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          payload: Json;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          payload?: Json;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          payload?: Json;
        };
        Relationships: [];
      };
      asset_tags: {
        Row: {
          asset_id: string;
          tag_id: string;
        };
        Insert: {
          asset_id: string;
          tag_id: string;
        };
        Update: {
          asset_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_tags_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          campaign_id: string;
          created_at: string;
          duration_seconds: number | null;
          file_name: string;
          file_size_bytes: number | null;
          file_url: string;
          generation_id: string | null;
          height: number | null;
          id: string;
          metadata_json: Json;
          mime_type: string | null;
          shot_id: string | null;
          source: Database["public"]["Enums"]["asset_source"];
          tags: string[] | null;
          type: Database["public"]["Enums"]["asset_type"];
          updated_at: string;
          width: number | null;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          duration_seconds?: number | null;
          file_name: string;
          file_size_bytes?: number | null;
          file_url: string;
          generation_id?: string | null;
          height?: number | null;
          id?: string;
          metadata_json?: Json;
          mime_type?: string | null;
          shot_id?: string | null;
          source?: Database["public"]["Enums"]["asset_source"];
          tags?: string[] | null;
          type: Database["public"]["Enums"]["asset_type"];
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          duration_seconds?: number | null;
          file_name?: string;
          file_size_bytes?: number | null;
          file_url?: string;
          generation_id?: string | null;
          height?: number | null;
          id?: string;
          metadata_json?: Json;
          mime_type?: string | null;
          shot_id?: string | null;
          source?: Database["public"]["Enums"]["asset_source"];
          tags?: string[] | null;
          type?: Database["public"]["Enums"]["asset_type"];
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "assets_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "shot_generations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_shot_id_fkey";
            columns: ["shot_id"];
            isOneToOne: false;
            referencedRelation: "shots";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_profiles: {
        Row: {
          campaign_name: string;
          created_at: string;
          creator_budget: string;
          creator_goal: string;
          geography_focus: string;
          launch_timeline: string;
          organization_id: string;
          owner_user_id: string;
          updated_at: string;
        };
        Insert: {
          campaign_name: string;
          created_at?: string;
          creator_budget: string;
          creator_goal: string;
          geography_focus: string;
          launch_timeline: string;
          organization_id: string;
          owner_user_id: string;
          updated_at?: string;
        };
        Update: {
          campaign_name?: string;
          created_at?: string;
          creator_budget?: string;
          creator_goal?: string;
          geography_focus?: string;
          launch_timeline?: string;
          organization_id?: string;
          owner_user_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_profiles_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          audience: string | null;
          brand_name: string | null;
          call_to_action: string | null;
          client_name: string | null;
          created_at: string;
          created_by: string | null;
          default_aspect_ratios: string[] | null;
          due_date: string | null;
          hook_angle: string | null;
          id: string;
          name: string;
          objective: string | null;
          offer: string | null;
          slug: string | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["campaign_status"];
          target_platforms: string[] | null;
          updated_at: string;
        };
        Insert: {
          audience?: string | null;
          brand_name?: string | null;
          call_to_action?: string | null;
          client_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_aspect_ratios?: string[] | null;
          due_date?: string | null;
          hook_angle?: string | null;
          id?: string;
          name: string;
          objective?: string | null;
          offer?: string | null;
          slug?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          target_platforms?: string[] | null;
          updated_at?: string;
        };
        Update: {
          audience?: string | null;
          brand_name?: string | null;
          call_to_action?: string | null;
          client_name?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_aspect_ratios?: string[] | null;
          due_date?: string | null;
          hook_angle?: string | null;
          id?: string;
          name?: string;
          objective?: string | null;
          offer?: string | null;
          slug?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["campaign_status"];
          target_platforms?: string[] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      creator_profiles: {
        Row: {
          audience_size: string;
          bio: string;
          content_focus: string;
          created_at: string;
          display_name: string;
          home_base: string;
          primary_platform: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          audience_size: string;
          bio: string;
          content_focus: string;
          created_at?: string;
          display_name: string;
          home_base: string;
          primary_platform: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          audience_size?: string;
          bio?: string;
          content_focus?: string;
          created_at?: string;
          display_name?: string;
          home_base?: string;
          primary_platform?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          organization_type: string;
          owner_user_id: string;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          organization_type: string;
          owner_user_id: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          organization_type?: string;
          owner_user_id?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          onboarding_completed: boolean;
          role: Database["public"]["Enums"]["app_role"] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean;
          role?: Database["public"]["Enums"]["app_role"] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean;
          role?: Database["public"]["Enums"]["app_role"] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_templates: {
        Row: {
          action_template: string | null;
          camera_template: string | null;
          category: string | null;
          constraints_template: string | null;
          created_at: string;
          description: string | null;
          dialogue_audio_template: string | null;
          environment_template: string | null;
          final_template: string | null;
          id: string;
          is_system: boolean;
          lighting_template: string | null;
          mood_template: string | null;
          name: string;
          subject_template: string | null;
          target_model: Database["public"]["Enums"]["target_model"] | null;
          updated_at: string;
          visual_style_template: string | null;
        };
        Insert: {
          action_template?: string | null;
          camera_template?: string | null;
          category?: string | null;
          constraints_template?: string | null;
          created_at?: string;
          description?: string | null;
          dialogue_audio_template?: string | null;
          environment_template?: string | null;
          final_template?: string | null;
          id?: string;
          is_system?: boolean;
          lighting_template?: string | null;
          mood_template?: string | null;
          name: string;
          subject_template?: string | null;
          target_model?: Database["public"]["Enums"]["target_model"] | null;
          updated_at?: string;
          visual_style_template?: string | null;
        };
        Update: {
          action_template?: string | null;
          camera_template?: string | null;
          category?: string | null;
          constraints_template?: string | null;
          created_at?: string;
          description?: string | null;
          dialogue_audio_template?: string | null;
          environment_template?: string | null;
          final_template?: string | null;
          id?: string;
          is_system?: boolean;
          lighting_template?: string | null;
          mood_template?: string | null;
          name?: string;
          subject_template?: string | null;
          target_model?: Database["public"]["Enums"]["target_model"] | null;
          updated_at?: string;
          visual_style_template?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          asset_id: string;
          created_at: string;
          decision: Database["public"]["Enums"]["review_decision"];
          id: string;
          notes: string | null;
          reviewer_name: string | null;
          score_brand_fit: number | null;
          score_editability: number | null;
          score_hook_strength: number | null;
          score_motion_quality: number | null;
          score_prompt_fidelity: number | null;
          score_realism: number | null;
          shot_id: string;
          updated_at: string;
        };
        Insert: {
          asset_id: string;
          created_at?: string;
          decision?: Database["public"]["Enums"]["review_decision"];
          id?: string;
          notes?: string | null;
          reviewer_name?: string | null;
          score_brand_fit?: number | null;
          score_editability?: number | null;
          score_hook_strength?: number | null;
          score_motion_quality?: number | null;
          score_prompt_fidelity?: number | null;
          score_realism?: number | null;
          shot_id: string;
          updated_at?: string;
        };
        Update: {
          asset_id?: string;
          created_at?: string;
          decision?: Database["public"]["Enums"]["review_decision"];
          id?: string;
          notes?: string | null;
          reviewer_name?: string | null;
          score_brand_fit?: number | null;
          score_editability?: number | null;
          score_hook_strength?: number | null;
          score_motion_quality?: number | null;
          score_prompt_fidelity?: number | null;
          score_realism?: number | null;
          shot_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_shot_id_fkey";
            columns: ["shot_id"];
            isOneToOne: false;
            referencedRelation: "shots";
            referencedColumns: ["id"];
          },
        ];
      };
      scenes: {
        Row: {
          campaign_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          objective: string | null;
          scene_number: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          objective?: string | null;
          scene_number: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          objective?: string | null;
          scene_number?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scenes_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      shot_generations: {
        Row: {
          aspect_ratio: string | null;
          created_at: string;
          duration_seconds: number | null;
          generation_notes: string | null;
          id: string;
          output_url: string | null;
          provider: Database["public"]["Enums"]["target_model"];
          provider_job_id: string | null;
          request_payload: Json;
          response_payload: Json;
          seed: string | null;
          shot_id: string;
          status: string;
          thumbnail_url: string | null;
          updated_at: string;
        };
        Insert: {
          aspect_ratio?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          generation_notes?: string | null;
          id?: string;
          output_url?: string | null;
          provider: Database["public"]["Enums"]["target_model"];
          provider_job_id?: string | null;
          request_payload?: Json;
          response_payload?: Json;
          seed?: string | null;
          shot_id: string;
          status?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Update: {
          aspect_ratio?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          generation_notes?: string | null;
          id?: string;
          output_url?: string | null;
          provider?: Database["public"]["Enums"]["target_model"];
          provider_job_id?: string | null;
          request_payload?: Json;
          response_payload?: Json;
          seed?: string | null;
          shot_id?: string;
          status?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shot_generations_shot_id_fkey";
            columns: ["shot_id"];
            isOneToOne: false;
            referencedRelation: "shots";
            referencedColumns: ["id"];
          },
        ];
      };
      shots: {
        Row: {
          aspect_ratio: string | null;
          campaign_id: string;
          camera_direction: string | null;
          constraints: string | null;
          created_at: string;
          dialogue_audio_intent: string | null;
          duration_seconds: number | null;
          environment: string | null;
          id: string;
          internal_notes: string | null;
          lighting: string | null;
          movement_direction: string | null;
          mood: string | null;
          negative_prompt: string | null;
          prompt_text: string | null;
          purpose: string | null;
          scene_id: string | null;
          scene_number: number;
          shot_number: number;
          status: Database["public"]["Enums"]["shot_status"];
          target_model: Database["public"]["Enums"]["target_model"];
          title: string;
          updated_at: string;
          visual_style: string | null;
        };
        Insert: {
          aspect_ratio?: string | null;
          campaign_id: string;
          camera_direction?: string | null;
          constraints?: string | null;
          created_at?: string;
          dialogue_audio_intent?: string | null;
          duration_seconds?: number | null;
          environment?: string | null;
          id?: string;
          internal_notes?: string | null;
          lighting?: string | null;
          movement_direction?: string | null;
          mood?: string | null;
          negative_prompt?: string | null;
          prompt_text?: string | null;
          purpose?: string | null;
          scene_id?: string | null;
          scene_number: number;
          shot_number: number;
          status?: Database["public"]["Enums"]["shot_status"];
          target_model: Database["public"]["Enums"]["target_model"];
          title: string;
          updated_at?: string;
          visual_style?: string | null;
        };
        Update: {
          aspect_ratio?: string | null;
          campaign_id?: string;
          camera_direction?: string | null;
          constraints?: string | null;
          created_at?: string;
          dialogue_audio_intent?: string | null;
          duration_seconds?: number | null;
          environment?: string | null;
          id?: string;
          internal_notes?: string | null;
          lighting?: string | null;
          movement_direction?: string | null;
          mood?: string | null;
          negative_prompt?: string | null;
          prompt_text?: string | null;
          purpose?: string | null;
          scene_id?: string | null;
          scene_number?: number;
          shot_number?: number;
          status?: Database["public"]["Enums"]["shot_status"];
          target_model?: Database["public"]["Enums"]["target_model"];
          title?: string;
          updated_at?: string;
          visual_style?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shots_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shots_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "scenes";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "creator" | "campaign";
      asset_source: "upload" | "generated" | "external_link" | "manual";
      asset_type:
        | "reference_image"
        | "reference_video"
        | "generated_video"
        | "thumbnail"
        | "logo"
        | "product_image"
        | "character_sheet"
        | "moodboard"
        | "audio_track"
        | "subtitle_file"
        | "edit_export";
      campaign_status: "draft" | "active" | "in_review" | "approved" | "archived";
      review_decision: "pending" | "selected" | "rejected" | "hold";
      shot_status:
        | "planned"
        | "prompt_ready"
        | "queued"
        | "generating"
        | "generated"
        | "reviewed"
        | "selected"
        | "rejected"
        | "archived";
      target_model: "sora" | "kling" | "higgsfield";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
